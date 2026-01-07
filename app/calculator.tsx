import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { COLORS } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function CostCalculatorPage() {
  const [costs, setCosts] = useState({
    rent: '',
    deposit: '',
    electricity: '',
    water: '',
    internet: '',
    cleaning: '',
    parking: '',
    other: '',
  });
  const [months, setMonths] = useState('12');

  // Hàm định dạng số tiền VNĐ
  const formatVND = (value: number) => {
    return value.toLocaleString('vi-VN') + 'đ';
  };

  const calculate = () => {
    const rent = parseFloat(costs.rent) || 0;
    const deposit = parseFloat(costs.deposit) || 0;
    const monthlyExtra = 
      (parseFloat(costs.electricity) || 0) +
      (parseFloat(costs.water) || 0) +
      (parseFloat(costs.internet) || 0) +
      (parseFloat(costs.cleaning) || 0) +
      (parseFloat(costs.parking) || 0) +
      (parseFloat(costs.other) || 0);

    const monthlyTotal = rent + monthlyExtra;
    const totalMonths = parseFloat(months) || 1;
    const grandTotal = monthlyTotal * totalMonths + deposit;
    const average = totalMonths > 0 ? grandTotal / totalMonths : 0;

    return { monthlyTotal, grandTotal, average, monthlyExtra };
  };

  const result = calculate();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Dự toán chi phí thuê phòng</Text>

      <View style={styles.section}>
        <View style={styles.rowTitle}>
          <Ionicons name="cash-outline" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Chi phí hàng tháng</Text>
        </View>
        
        <Text style={styles.label}>Tiền thuê phòng</Text>
        <TextInput style={[styles.input, styles.importantInput]} placeholder="0" keyboardType="numeric" value={costs.rent} onChangeText={t => setCosts({...costs, rent: t})} />
        
        <View style={styles.gridInputs}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Điện</Text>
            <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={costs.electricity} onChangeText={t => setCosts({...costs, electricity: t})} />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Nước</Text>
            <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={costs.water} onChangeText={t => setCosts({...costs, water: t})} />
          </View>
        </View>

        <View style={styles.gridInputs}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Internet</Text>
            <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={costs.internet} onChangeText={t => setCosts({...costs, internet: t})} />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Gửi xe</Text>
            <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={costs.parking} onChangeText={t => setCosts({...costs, parking: t})} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.rowTitle}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Cọc & Thời hạn</Text>
        </View>
        <Text style={styles.label}>Tiền đặt cọc</Text>
        <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={costs.deposit} onChangeText={t => setCosts({...costs, deposit: t})} />
        <Text style={styles.label}>Số tháng dự kiến thuê</Text>
        <TextInput style={styles.input} placeholder="12" keyboardType="numeric" value={months} onChangeText={setMonths} />
      </View>

      <View style={styles.resultCard}>
        <Text style={styles.resultHeader}>Tổng kết chi phí</Text>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Phí dịch vụ cố định/tháng:</Text>
          <Text style={styles.resultValueText}>{formatVND(result.monthlyExtra)}</Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Tổng chi/tháng:</Text>
          <Text style={styles.resultValueText}>{formatVND(result.monthlyTotal)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <View>
            <Text style={styles.grandTotalLabel}>Tổng chi phí cả kỳ hạn</Text>
            <Text style={styles.subLabel}>(Bao gồm cọc {months} tháng)</Text>
          </View>
          <Text style={styles.resultValueBig}>{formatVND(result.grandTotal)}</Text>
        </View>

        <View style={[styles.resultRow, {marginTop: 15}]}>
          <Text style={styles.resultLabel}>Trung bình thực tế/tháng:</Text>
          <Text style={styles.averageValue}>{formatVND(result.average)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={() => setCosts({rent: '', deposit: '', electricity: '', water: '', internet: '', cleaning: '', parking: '', other: ''})}>
        <Text style={styles.resetBtnText}>Làm mới tính toán</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  section: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  rowTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#444' },
  label: { fontSize: 13, color: '#888', marginBottom: 5, marginLeft: 2 },
  input: { backgroundColor: '#FDFDFD', borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 10, marginBottom: 12, fontSize: 15 },
  importantInput: { borderColor: COLORS.primary + '40', backgroundColor: COLORS.primary + '05', fontWeight: '600' },
  gridInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  resultCard: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 20, marginBottom: 20 },
  resultHeader: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 20, textAlign: 'center' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  resultLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  resultValueText: { color: 'white', fontWeight: '600', fontSize: 15 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 15 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grandTotalLabel: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  subLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  resultValueBig: { color: 'white', fontSize: 22, fontWeight: '800' },
  averageValue: { color: '#FFD700', fontWeight: 'bold', fontSize: 16 },
  resetBtn: { padding: 15, alignItems: 'center', marginBottom: 40 },
  resetBtnText: { color: '#999', fontSize: 14, textDecorationLine: 'underline' }
});