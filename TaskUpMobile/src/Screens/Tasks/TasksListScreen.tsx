import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../Hooks/UseTheme';
import { TaskCard } from '../../Components/Cards/TaskCard';
import { SearchBar } from '../../Components/UI/SearchBar';
import { Text } from '../../Components/UI/Text';
import { EmptyState } from '../../Components/UI/EmptyState';
import { TaskService } from '../../Services/TaskService';
import { FilterModal } from '../../Components/Modals/FilterModal';
import { Segmented } from '../../Components/UI/Segmented';
import Icon from 'react-native-vector-icons/Ionicons';

export const TasksListScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    priority: null,
    sortBy: 'newest',
  });

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await TaskService.getTasks();
      setTasks(data);
      applyFilters(data, searchQuery, filters);
    } catch (error) {
      console.error('Failed to load tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const applyFilters = (data, query, activeFilters) => {
    let result = [...data];
    
    // Apply search query
    if (query) {
      const lowercasedQuery = query.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(lowercasedQuery) ||
        (task.description && task.description.toLowerCase().includes(lowercasedQuery))
      );
    }
    
    // Apply status filter
    if (activeFilters.status) {
      result = result.filter(task => task.status === activeFilters.status);
    }
    
    // Apply priority filter
    if (activeFilters.priority) {
      result = result.filter(task => task.priority === activeFilters.priority);
    }
    
    // Apply sorting
    switch (activeFilters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || b.deadline) - new Date(a.createdAt || a.deadline));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt || a.deadline) - new Date(b.createdAt || b.deadline));
        break;
      case 'deadline':
        result.sort((a, b) => new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31'));
        break;
      case 'priority':
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      default:
        break;
    }
    
    setFilteredTasks(result);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(tasks, query, filters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    applyFilters(tasks, searchQuery, newFilters);
    setShowFilterModal(false);
  };

  const handleStatusChange = (taskId, status) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    );
    setTasks(updatedTasks);
    applyFilters(updatedTasks, searchQuery, filters);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        placeholder="Search tasks..."
        value={searchQuery}
        onChangeText={handleSearch}
        onClear={() => handleSearch('')}
      />
      
      <View style={styles.viewOptions}>
        <Segmented
          options={[
            { label: 'List', value: 'list', icon: 'list-outline' },
            { label: 'Board', value: 'board', icon: 'grid-outline' },
          ]}
          value={viewMode}
          onChange={setViewMode}
        />
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="options-outline" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyComponent = () => {
    if (loading) return null;
    
    return (
      <EmptyState 
        title="No Tasks Found"
        message={
          searchQuery
            ? "No tasks match your search criteria."
            : "You don't have any tasks yet. Create your first task to get started."
        }
        icon="list-outline"
      />
    );
  };

  const groupTasksByStatus = () => {
    const groups = {
      'Not Started': [],
      'In Progress': [],
      'Completed': [],
    };
    
    filteredTasks.forEach(task => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      } else {
        groups['Not Started'].push(task);
      }
    });
    
    return groups;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {viewMode === 'list' ? (
        <FlatList
          data={filteredTasks}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              variant="default"
              onStatusChange={handleStatusChange}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        />
      ) : (
        <View style={styles.boardContainer}>
          {renderHeader()}
          
          <View style={styles.columnsContainer}>
            {Object.entries(groupTasksByStatus()).map(([status, statusTasks]) => (
              <View 
                key={status} 
                style={[
                  styles.column, 
                  { 
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  }
                ]}
              >
                <Text variant="h3" style={styles.columnTitle}>
                  {status}
                </Text>
                <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                  {statusTasks.length} {statusTasks.length === 1 ? 'task' : 'tasks'}
                </Text>
                
                <FlatList
                  data={statusTasks}
                  renderItem={({ item }) => (
                    <TaskCard
                      task={item}
                      variant="compact"
                      onStatusChange={handleStatusChange}
                    />
                  )}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.columnContent}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            ))}
          </View>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CreateTask')}
      >
        <Icon name="add" size={24} color="white" />
      </TouchableOpacity>
      
      <FilterModal
        isVisible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onApplyFilters={handleFilterChange}
        filterOptions={{
          status: [
            { label: 'All', value: null },
            { label: 'Not Started', value: 'Not Started' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Completed', value: 'Completed' },
          ],
          priority: [
            { label: 'All', value: null },
            { label: 'High', value: 'High' },
            { label: 'Medium', value: 'Medium' },
            { label: 'Low', value: 'Low' },
          ],
          sortBy: [
            { label: 'Newest First', value: 'newest' },
            { label: 'Oldest First', value: 'oldest' },
            { label: 'Deadline', value: 'deadline' },
            { label: 'Priority', value: 'priority' },
          ],
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 16,
    padding: 16,
  },
  viewOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  boardContainer: {
    flex: 1,
  },
  columnsContainer: {
    flexDirection: 'row',
    padding: 8,
    flex: 1,
  },
  column: {
    flex: 1,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 300,
  },
  columnTitle: {
    marginBottom: 4,
  },
  columnContent: {
    paddingTop: 12,
    paddingBottom: 20,
  },
});