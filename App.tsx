import React, {useEffect, useState, useCallback} from 'react';
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useColorScheme,
  ListRenderItemInfo
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {Swipeable} from 'react-native-gesture-handler';

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export default function App() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const [task, setTask] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);

  // define saveTasks before useEffect to avoid lint/react warning
  const saveTasks = useCallback(async () => {
    try {
      await AsyncStorage.setItem('TASKS', JSON.stringify(tasks));
    } catch (e) {
      // Using 'any' for error as React Native AsyncStorage error is not always typed
      console.log('Save error', e);
    }
  }, [tasks]);

  const loadTasks = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('TASKS');
      if (data) setTasks(JSON.parse(data));
    } catch (e) {
      console.log('Load error', e);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    saveTasks();
  }, [tasks, saveTasks]);

  const addTask = useCallback(() => {
    if (!task.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: task,
      completed: false,
    };

    setTasks(prev => [newTask, ...prev]);
    setTask('');
  }, [task]);

  const toggleComplete = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? {...t, completed: !t.completed} : t,
      ),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const renderRight = (id: string) => (
    <TouchableOpacity
      style={styles.deleteBtn}
      onPress={() => deleteTask(id)}>
      <Text style={{color: '#fff'}}><Text>Delete</Text></Text>
    </TouchableOpacity>
  );

  const renderItem = ({item}: ListRenderItemInfo<Task>) => (
    <Swipeable renderRightActions={() => renderRight(item.id)}>
      <TouchableOpacity
        style={[
          styles.task,
          {backgroundColor: dark ? '#1e1e1e' : '#eee'},
        ]}
        onPress={() => toggleComplete(item.id)}>

        <Text style={{
          color: dark ? '#fff' : '#000',
          textDecorationLine: item.completed
            ? 'line-through'
            : 'none',
        }}>
          <Text>{item.completed ? '✅ ' : '⬜ '}</Text>
          <Text> {item.title}</Text>
        </Text>

      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={[
        styles.container,
        {backgroundColor: dark ? '#121212' : '#fff'},
      ]}>
        <Text style={[
          styles.title,
          {color: dark ? '#fff' : '#000'},
        ]}>
          <Text>Todo App</Text>
        </Text>

        <View style={styles.inputRow}>
          {/* TextInput's placeholder cannot use nested Text, so leave as is */}
          <TextInput
            style={[
              styles.input,
              {
                color: dark ? '#fff' : '#000',
                borderColor: dark ? '#555' : '#ccc',
              },
            ]}
            placeholder="Add a task..."
            placeholderTextColor={dark ? '#aaa' : '#666'}
            value={task}
            onChangeText={setTask}
          />

          <TouchableOpacity style={styles.addBtn} onPress={addTask}>
            <Text style={{color: '#fff'}}><Text>Add</Text></Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, marginTop: 40},
  title: {fontSize: 28, fontWeight: 'bold', marginBottom: 20},
  inputRow: {flexDirection: 'row', marginBottom: 20},
  input: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  addBtn: {
    backgroundColor: '#007AFF',
    padding: 12,
    marginLeft: 10,
    borderRadius: 8,
  },
  task: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  deleteBtn: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 12,
    borderRadius: 10,
  },
});



