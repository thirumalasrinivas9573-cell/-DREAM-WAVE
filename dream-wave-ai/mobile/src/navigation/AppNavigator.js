import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen     from '../screens/LoginScreen';
import RegisterScreen  from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import GoalChatScreen  from '../screens/GoalChatScreen';
import RoadmapScreen   from '../screens/RoadmapScreen';
import ReportScreen    from '../screens/ReportScreen';
import TasksScreen     from '../screens/TasksScreen';
import BooksScreen     from '../screens/BooksScreen';
import DailyLifeScreen from '../screens/DailyLifeScreen';
import MentorScreen    from '../screens/MentorScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ProfileScreen   from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!user ? (
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="GoalChat"  component={GoalChatScreen} />
            <Stack.Screen name="Roadmap"   component={RoadmapScreen} />
            <Stack.Screen name="Report"    component={ReportScreen} />
            <Stack.Screen name="Tasks"     component={TasksScreen} />
            <Stack.Screen name="Books"     component={BooksScreen} />
            <Stack.Screen name="DailyLife" component={DailyLifeScreen} />
            <Stack.Screen name="Mentor"    component={MentorScreen} />
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="Profile"   component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
