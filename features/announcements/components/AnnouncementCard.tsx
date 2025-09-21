import { Colors } from "@/constants/Colors";
import { Announcement } from "@/types/announcement";
import { formatDate } from "@/utils/formatDate";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme
} from "react-native";

// Extended type for creating/editing announcements
interface AnnouncementFormData {
  title: string;
  content: string;
  category?: string;
  date: string;
}

type Props = { 
  announcement?: Announcement;
  mode: 'view' | 'edit' | 'create';
  onSave?: (announcement: AnnouncementFormData) => void;
  onCancel?: () => void;
};

// Predefined categories for selection
const CATEGORIES = [
  "General",
  "Event",
  "Emergency",
  "Maintenance",
  "Community",
  "Update",
  "Meeting",
  "Other"
];

// Time slots for easy selection
const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
];

export default function AnnouncementCard({ announcement, mode, onSave, onCancel }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  
  const [title, setTitle] = useState(announcement?.title || "");
  const [content, setContent] = useState(announcement?.content || "");
  const [category, setCategory] = useState(announcement?.category || "");
  const [date, setDate] = useState(announcement?.date ? new Date(announcement.date) : new Date());
  const [time, setTime] = useState(announcement?.date ? new Date(announcement.date) : new Date());
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const isEditing = mode === 'edit' || mode === 'create';

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    
    // Combine date and time
    const combinedDate = new Date(date);
    combinedDate.setHours(time.getHours());
    combinedDate.setMinutes(time.getMinutes());
    
    onSave?.({
      title: title.trim(),
      content: content.trim(),
      category: category || undefined,
      date: combinedDate.toISOString()
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleTimeSlotSelect = (timeString: string) => {
    const [timePart, modifier] = timeString.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    const newTime = new Date(time);
    newTime.setHours(hours);
    newTime.setMinutes(minutes);
    setTime(newTime);
    setShowTimeSlots(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateDisplay = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  // View mode - just display the announcement
  if (mode === 'view' && announcement) {
    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {/* Title */}
        <Text style={[styles.title, { color: theme.text }]}>
          {announcement.title}
        </Text>

        {/* Content */}
        <Text style={[styles.content, { color: theme.secondaryText }]}>
          {announcement.content}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.meta, { color: theme.secondaryText }]}>
            {announcement.author} • {formatDate(announcement.date)}
          </Text>

          {announcement.category && (
            <View
              style={[
                styles.categoryPill,
                { backgroundColor: theme.tint + "20" },
              ]}
            >
              <Text style={[styles.categoryText, { color: theme.tint }]}>
                {announcement.category}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Edit/Create mode
  return (
    <ScrollView style={[styles.editorCard, { backgroundColor: theme.card }]}>
      {/* Title input */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Title *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.background, 
            color: theme.text,
            borderColor: theme.border 
          }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter announcement title"
          placeholderTextColor={theme.secondaryText}
        />
      </View>

      {/* Content input */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Content *</Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: theme.background, 
            color: theme.text,
            borderColor: theme.border,
            textAlignVertical: 'top'
          }]}
          value={content}
          onChangeText={setContent}
          placeholder="Enter announcement content"
          placeholderTextColor={theme.secondaryText}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Date and Time selection */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Date & Time</Text>
        
        {/* Date Selection */}
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.dateTimeButton, { backgroundColor: theme.background, flex: 2 }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={18} color={theme.tint} />
            <Text style={[styles.dateTimeText, { color: theme.text, marginLeft: 8 }]}>
              {formatFullDate(date)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.dateTimeButton, { backgroundColor: theme.background, flex: 1, marginLeft: 8 }]}
            onPress={() => setShowTimeSlots(true)}
          >
            <Ionicons name="time" size={18} color={theme.tint} />
            <Text style={[styles.dateTimeText, { color: theme.text, marginLeft: 8 }]}>
              {formatTime(time)}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Quick date options */}
        <View style={styles.quickOptions}>
          <Text style={[styles.quickOptionsLabel, { color: theme.secondaryText }]}>Quick select:</Text>
          <View style={styles.quickOptionsRow}>
            {['Today', 'Tomorrow', 'Next Week'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.quickOption, { backgroundColor: theme.background }]}
                onPress={() => {
                  const newDate = new Date();
                  if (option === 'Tomorrow') newDate.setDate(newDate.getDate() + 1);
                  if (option === 'Next Week') newDate.setDate(newDate.getDate() + 7);
                  setDate(newDate);
                }}
              >
                <Text style={[styles.quickOptionText, { color: theme.text }]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Category selector */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Category</Text>
        <TouchableOpacity 
          style={[styles.pickerButton, { backgroundColor: theme.background }]}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={[styles.pickerText, { color: category ? theme.text : theme.secondaryText }]}>
            {category || "Select a category"}
          </Text>
          <Ionicons name="chevron-down" size={16} color={theme.secondaryText} />
        </TouchableOpacity>
      </View>

      {/* Action buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton, { backgroundColor: theme.background }]}
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.saveButton, { 
            backgroundColor: title.trim() && content.trim() ? theme.tint : theme.secondaryText + '60' 
          }]}
          onPress={handleSave}
          disabled={!title.trim() || !content.trim()}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.pickerModalContainer}>
              <View style={[styles.pickerModal, { backgroundColor: theme.card }]}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={[styles.pickerButtonText, { color: theme.tint }]}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={[styles.pickerTitle, { color: theme.text }]}>Select Date</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={[styles.pickerButtonText, { color: theme.tint }]}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date(2025, 0, 1)}
                  // Remove the themeVariant prop to fix the TypeScript error
                  style={styles.iosPicker}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date(2025, 0, 1)}
          />
        )
      )}

      {/* Time Picker (Android) */}
      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* Time Slots Modal */}
      <Modal
        visible={showTimeSlots}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeSlots(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowTimeSlots(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Select Time</Text>
                <ScrollView>
                  <View style={styles.timeGrid}>
                    {TIME_SLOTS.map((timeSlot) => (
                      <TouchableOpacity
                        key={timeSlot}
                        style={[
                          styles.timeSlot,
                          { backgroundColor: theme.background },
                          formatTime(time) === timeSlot && { 
                            backgroundColor: theme.tint,
                            borderColor: theme.tint
                          }
                        ]}
                        onPress={() => handleTimeSlotSelect(timeSlot)}
                      >
                        <Text style={[
                          styles.timeSlotText,
                          { color: theme.text },
                          formatTime(time) === timeSlot && { color: 'white' }
                        ]}>
                          {timeSlot}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  {/* Custom time option */}
                  <TouchableOpacity
                    style={[styles.customTimeButton, { backgroundColor: theme.background }]}
                    onPress={() => {
                      setShowTimeSlots(false);
                      setTimeout(() => setShowTimePicker(true), 100);
                    }}
                  >
                    <Ionicons name="time-outline" size={18} color={theme.tint} />
                    <Text style={[styles.customTimeText, { color: theme.text, marginLeft: 8 }]}>
                      Custom Time
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Select Category</Text>
                <ScrollView>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.modalOption, cat === category && { backgroundColor: theme.tint + '20' }]}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategoryModal(false);
                      }}
                    >
                      <Text style={[styles.modalOptionText, { color: theme.text }]}>{cat}</Text>
                      {cat === category && (
                        <Ionicons name="checkmark" size={20} color={theme.tint} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  editorCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  content: {
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  meta: {
    fontSize: 12,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    minHeight: 120,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    borderColor: '#ddd',
  },
  pickerText: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    borderColor: '#ddd',
  },
  dateTimeText: {
    fontSize: 15,
    fontWeight: '500',
  },
  quickOptions: {
    marginTop: 12,
  },
  quickOptionsLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  quickOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  quickOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    borderRadius: 10,
    padding: 14,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    marginLeft: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 16,
    flex: 1,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeSlot: {
    width: '48%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  customTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    justifyContent: 'center',
  },
  customTimeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  iosPicker: {
    height: 200,
  },
});