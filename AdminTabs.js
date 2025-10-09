import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HorsesScreen from './HorsesScreen';
import FeedScreen from './FeedScreen';
import LessonsScreen from './LessonsScreen';
import ClientsScreen from './ClientsScreen';
import WorkersScreen from './WorkersScreen';

// Bottom tab navigation for the admin section.  Each tab displays a specific
// administrative view such as horse management, feeding schedules, lessons,
// client payments or worker directory.
const Tab = createBottomTabNavigator();

const AdminTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Horses" component={HorsesScreen} />
      <Tab.Screen name="Feeding" component={FeedScreen} />
      <Tab.Screen name="Lessons" component={LessonsScreen} />
      <Tab.Screen name="Clients" component={ClientsScreen} />
      <Tab.Screen name="Workers" component={WorkersScreen} />
    </Tab.Navigator>
  );
};

export default AdminTabs;