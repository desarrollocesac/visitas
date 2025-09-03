import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';

// API Configuration
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface Visit {
  id: string;
  visitorName: string;
  company?: string;
  hostName: string;
  department: string;
  purpose: string;
  checkInTime: string;
  status: 'active' | 'completed';
  accessAreas: string[];
  durationSeconds?: number;
  durationFormatted?: string;
}

interface AccessAttempt {
  success: boolean;
  visit?: Visit;
  accessGranted?: boolean;
  reason?: string;
}

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const departments = [
    'Recepción',
    'Administración', 
    'Ventas',
    'Marketing',
    'IT',
    'Recursos Humanos',
    'Contabilidad',
    'Gerencia'
  ];

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const searchVisit = async (query: string) => {
    if (!query.trim()) {
      Alert.alert('Error', 'Por favor ingrese un ID de visita o número de identificación');
      return;
    }

    setLoading(true);
    try {
      // Try searching by visit ID first
      let response = await fetch(`${API_BASE}/api/visits/${query}`);
      
      if (!response.ok) {
        // If not found, try searching by visitor ID number
        response = await fetch(`${API_BASE}/api/visitors/id-number/${query}`);
        
        if (!response.ok) {
          throw new Error('Visita o visitante no encontrado');
        }
        
        const data = await response.json();
        if (data.success && data.data.visits && data.data.visits.length > 0) {
          // Get the most recent active visit
          const activeVisit = data.data.visits.find((v: any) => v.status === 'active');
          if (activeVisit) {
            setCurrentVisit({
              id: activeVisit.id,
              visitorName: `${data.data.visitor.firstName} ${data.data.visitor.lastName}`,
              company: data.data.visitor.company,
              hostName: activeVisit.hostName,
              department: activeVisit.department,
              purpose: activeVisit.purpose,
              checkInTime: activeVisit.checkInTime,
              status: activeVisit.status,
              accessAreas: activeVisit.accessAreas || []
            });
          } else {
            throw new Error('No se encontraron visitas activas para este visitante');
          }
        } else {
          throw new Error('No se encontraron visitas para este visitante');
        }
      } else {
        const data = await response.json();
        if (data.success) {
          setCurrentVisit({
            id: data.data.id,
            visitorName: `${data.data.visitorFirstName} ${data.data.visitorLastName}`,
            company: data.data.visitorCompany,
            hostName: data.data.hostName,
            department: data.data.department,
            purpose: data.data.purpose,
            checkInTime: data.data.checkInTime,
            status: data.data.status,
            accessAreas: data.data.accessAreas || [],
            durationSeconds: data.data.durationSeconds,
            durationFormatted: data.data.durationFormatted
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al buscar la visita');
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async (department: string) => {
    if (!currentVisit || !department) {
      Alert.alert('Error', 'Seleccione un departamento');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/visits/${currentVisit.id}/check-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ department }),
      });

      const data = await response.json();
      
      if (data.success) {
        const accessGranted = data.data.accessGranted;
        const reason = data.data.reason;
        
        Alert.alert(
          accessGranted ? '✅ Acceso Concedido' : '❌ Acceso Denegado',
          `${reason}\n\nVisitante: ${currentVisit.visitorName}\nDepartamento: ${department}`,
          [{ text: 'OK' }]
        );

        // Update visit information with current duration
        if (data.data.visit) {
          setCurrentVisit(prev => prev ? {
            ...prev,
            durationSeconds: data.data.visit.durationSeconds,
            durationFormatted: data.data.visit.durationFormatted
          } : null);
        }
      } else {
        throw new Error(data.error || 'Error al verificar el acceso');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al verificar el acceso');
    } finally {
      setLoading(false);
    }
  };

  const checkoutVisit = async () => {
    if (!currentVisit) return;

    Alert.alert(
      'Confirmar Checkout',
      `¿Está seguro de que desea hacer checkout de la visita de ${currentVisit.visitorName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(`${API_BASE}/api/visits/${currentVisit.id}/checkout`, {
                method: 'PUT',
              });

              const data = await response.json();
              
              if (data.success) {
                Alert.alert('✅ Checkout Completado', 'La visita ha sido marcada como completada');
                setCurrentVisit(null);
                setSearchText('');
              } else {
                throw new Error(data.error || 'Error al hacer checkout');
              }
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Error al hacer checkout');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScannerVisible(false);
    
    try {
      // Try to parse QR code data
      const qrData = JSON.parse(data);
      if (qrData.visitId) {
        setSearchText(qrData.visitId);
        searchVisit(qrData.visitId);
      } else {
        // If not JSON, treat as direct visit ID
        setSearchText(data);
        searchVisit(data);
      }
    } catch {
      // If not JSON, treat as direct visit ID
      setSearchText(data);
      searchVisit(data);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No hay acceso a la cámara</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Control de Accesos</Text>
        <Text style={styles.headerSubtitle}>Sistema de Visitas</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Buscar Visita</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="ID de Visita o Cédula del Visitante"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => searchVisit(searchText)}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => searchVisit(searchText)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="search" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.qrButton}
            onPress={() => setScannerVisible(true)}
          >
            <Ionicons name="qr-code" size={24} color="#007bff" />
            <Text style={styles.qrButtonText}>Escanear QR</Text>
          </TouchableOpacity>
        </View>

        {/* Visit Information */}
        {currentVisit && (
          <View style={styles.visitCard}>
            <View style={styles.visitHeader}>
              <Text style={styles.visitorName}>{currentVisit.visitorName}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: currentVisit.status === 'active' ? '#28a745' : '#6c757d' }
              ]}>
                <Text style={styles.statusText}>
                  {currentVisit.status === 'active' ? 'ACTIVA' : 'COMPLETADA'}
                </Text>
              </View>
            </View>

            {currentVisit.company && (
              <Text style={styles.company}>{currentVisit.company}</Text>
            )}

            <View style={styles.visitDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="person" size={16} color="#666" />
                <Text style={styles.detailLabel}>Anfitrión:</Text>
                <Text style={styles.detailValue}>{currentVisit.hostName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="business" size={16} color="#666" />
                <Text style={styles.detailLabel}>Departamento:</Text>
                <Text style={styles.detailValue}>{currentVisit.department}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="document-text" size={16} color="#666" />
                <Text style={styles.detailLabel}>Propósito:</Text>
                <Text style={styles.detailValue}>{currentVisit.purpose}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.detailLabel}>Entrada:</Text>
                <Text style={styles.detailValue}>{formatDateTime(currentVisit.checkInTime)}</Text>
              </View>

              {currentVisit.durationSeconds !== undefined && (
                <View style={styles.detailRow}>
                  <Ionicons name="hourglass" size={16} color="#666" />
                  <Text style={styles.detailLabel}>Duración:</Text>
                  <Text style={styles.detailValue}>
                    {currentVisit.durationFormatted || formatDuration(currentVisit.durationSeconds)}
                  </Text>
                </View>
              )}

              {currentVisit.accessAreas.length > 0 && (
                <View style={styles.accessAreas}>
                  <Text style={styles.accessAreasTitle}>Áreas Autorizadas:</Text>
                  <View style={styles.areasContainer}>
                    {currentVisit.accessAreas.map((area, index) => (
                      <View key={index} style={styles.areaChip}>
                        <Text style={styles.areaChipText}>{area}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Access Control */}
            {currentVisit.status === 'active' && (
              <View style={styles.accessControl}>
                <Text style={styles.sectionTitle}>Verificar Acceso</Text>
                
                <View style={styles.departmentGrid}>
                  {departments.map((dept) => (
                    <TouchableOpacity
                      key={dept}
                      style={[
                        styles.departmentButton,
                        selectedDepartment === dept && styles.departmentButtonSelected
                      ]}
                      onPress={() => {
                        setSelectedDepartment(dept);
                        checkAccess(dept);
                      }}
                      disabled={loading}
                    >
                      <Text style={[
                        styles.departmentButtonText,
                        selectedDepartment === dept && styles.departmentButtonTextSelected
                      ]}>
                        {dept}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity 
                  style={styles.checkoutButton}
                  onPress={checkoutVisit}
                  disabled={loading}
                >
                  <Ionicons name="exit" size={20} color="#fff" />
                  <Text style={styles.checkoutButtonText}>Hacer Checkout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={scannerVisible}
        onRequestClose={() => setScannerVisible(false)}
      >
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Escanear Código QR</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setScannerVisible(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerInstructions}>
              Apunte la cámara al código QR del sticker del visitante
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e3f2fd',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007bff',
    borderStyle: 'dashed',
  },
  qrButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  visitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  company: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  visitDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  accessAreas: {
    marginTop: 12,
  },
  accessAreasTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  areasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  areaChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  areaChipText: {
    fontSize: 12,
    color: '#1976d2',
  },
  accessControl: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  departmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  departmentButton: {
    width: '48%',
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  departmentButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  departmentButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  departmentButtonTextSelected: {
    color: '#fff',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1,
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerInstructions: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});
