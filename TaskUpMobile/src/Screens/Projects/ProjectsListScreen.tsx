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
import { ProjectCard } from '../../Components/Cards/ProjectCard';
import { SearchBar } from '../../Components/UI/SearchBar';
import { Text } from '../../Components/UI/Text';
import { EmptyState } from '../../Components/UI/EmptyState';
import { ProjectService } from '../../Services/ProjectService';
import { FilterModal } from '../../Components/Modals/FilterModal';
import Icon from 'react-native-vector-icons/Ionicons';

export const ProjectsListScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isGridView, setIsGridView] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    sortBy: 'newest',
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await ProjectService.getProjects();
      setProjects(data);
      applyFilters(data, searchQuery, filters);
    } catch (error) {
      console.error('Failed to load projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const applyFilters = (data, query, activeFilters) => {
    let result = [...data];
    
    // Apply search query
    if (query) {
      const lowercasedQuery = query.toLowerCase();
      result = result.filter(project => 
        project.name.toLowerCase().includes(lowercasedQuery) ||
        (project.description && project.description.toLowerCase().includes(lowercasedQuery))
      );
    }
    
    // Apply status filter
    if (activeFilters.status) {
      result = result.filter(project => project.status === activeFilters.status);
    }
    
    // Apply sorting
    switch (activeFilters.sortBy) {
      case 'newest':
        // Assuming each project has a createdAt field
        result.sort((a, b) => new Date(b.createdAt || b.deadline) - new Date(a.createdAt || a.deadline));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt || a.deadline) - new Date(b.createdAt || b.deadline));
        break;
      case 'deadline':
        result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        break;
      case 'progress':
        result.sort((a, b) => b.progress - a.progress);
        break;
      default:
        break;
    }
    
    setFilteredProjects(result);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(projects, query, filters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    applyFilters(projects, searchQuery, newFilters);
    setShowFilterModal(false);
  };

  const toggleViewMode = () => {
    setIsGridView(!isGridView);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        placeholder="Search projects..."
        value={searchQuery}
        onChangeText={handleSearch}
        onClear={() => handleSearch('')}
      />
      
      <View style={styles.filterContainer}>
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
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={toggleViewMode}
        >
          <Icon
            name={isGridView ? "grid-outline" : "list-outline"}
            size={20}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyComponent = () => {
    if (loading) return null;
    
    return (
      <EmptyState 
        title="No Projects Found"
        message={
          searchQuery
            ? "No projects match your search criteria."
            : "You don't have any projects yet. Create your first project to get started."
        }
        icon="folder-outline"
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredProjects}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            variant={isGridView ? 'default' : 'horizontal'}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={isGridView ? 1 : 1}
        key={isGridView ? 'grid' : 'list'}
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
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CreateProject')}
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
            { label: 'On Hold', value: 'On Hold' },
          ],
          sortBy: [
            { label: 'Newest First', value: 'newest' },
            { label: 'Oldest First', value: 'oldest' },
            { label: 'Deadline', value: 'deadline' },
            { label: 'Progress', value: 'progress' },
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
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
});