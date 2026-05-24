import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  /** Igual ao modal de feedback da tela de importação/exportação */
  variant?: 'success' | 'error';
};

export function FeedbackModal({ visible, title, message, onClose, variant = 'success' }: Props) {
  const isError = variant === 'error';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlayCenter} onPress={onClose}>
        <View style={styles.feedbackModalCard} onStartShouldSetResponder={() => true}>
          <View style={[styles.feedbackIconWrap, isError && styles.feedbackIconWrapError]}>
            <MaterialCommunityIcons
              name={isError ? 'alert-circle-outline' : 'check-decagram-outline'}
              size={30}
              color={isError ? '#dc2626' : '#0d9488'}
            />
          </View>
          <Text style={styles.feedbackTitle}>{title}</Text>
          <Text style={styles.feedbackMessage}>{message}</Text>
          <Pressable style={[styles.feedbackBtn, isError && styles.feedbackBtnError]} onPress={onClose}>
            <Text style={styles.feedbackBtnText}>OK</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  feedbackModalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  feedbackIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  feedbackIconWrapError: {
    backgroundColor: '#fee2e2',
  },
  feedbackTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  feedbackMessage: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  feedbackBtn: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    alignItems: 'center',
  },
  feedbackBtnError: {
    backgroundColor: '#dc2626',
  },
  feedbackBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
