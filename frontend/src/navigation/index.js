/**
 * Navigation setup for Focus Health Academy
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Auth screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';

// Public screens
import HomeScreen from '../screens/Public/HomeScreen';
import CoursesScreen from '../screens/Public/CoursesScreen';
import CourseDetailsScreen from '../screens/Public/CourseDetailsScreen';
import EventsScreen from '../screens/Public/EventsScreen';
import EventDetailsScreen from '../screens/Public/EventDetailsScreen';
import QRCodeViewer from '../screens/Public/QRCodeViewer';

// Payment screens
import PaymentScreen from '../screens/Payment/PaymentScreen';

// Timeline screens
import TimelineScreen from '../screens/Timeline/TimelineScreen';
import CreatePostScreen from '../screens/Timeline/CreatePostScreen';
import PostDetailsScreen from '../screens/Timeline/PostDetailsScreen';

// Profile screens
import ProfileScreen from '../screens/Profile/ProfileScreen';
import MyCoursesScreen from '../screens/Profile/MyCoursesScreen';
import CoursePlayerScreen from '../screens/Profile/CoursePlayerScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import MyTicketsScreen from '../screens/Profile/MyTicketsScreen';

// Notifications screens
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';

// Admin screens
import CreateCourseScreen from '../screens/Admin/CreateCourseScreen';
import CreateEventScreen from '../screens/Admin/CreateEventScreen';
import EditCourseScreen from '../screens/Admin/EditCourseScreen';
import EditEventScreen from '../screens/Admin/EditEventScreen';
import AdminUsersScreen from '../screens/Admin/AdminUsersScreen';
import ManageCourseLessonsScreen from '../screens/Admin/ManageCourseLessonsScreen';
import OrdersScreen from '../screens/Admin/OrdersScreen';
import QRScannerScreen from '../screens/Admin/QRScannerScreen';

// Legal screens
import PrivacyPolicyScreen from '../screens/Legal/PrivacyPolicyScreen';
import TermsConditionsScreen from '../screens/Legal/TermsConditionsScreen';

import theme from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Home Stack Navigator
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: theme.colors.white,
      headerTitleStyle: {
        fontWeight: theme.typography.fontWeight.bold,
      },
    }}
  >
    <Stack.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ title: 'Focus Health Academy' }}
    />
    <Stack.Screen 
      name="CourseDetails" 
      component={CourseDetailsScreen}
      options={{ title: 'Course Details' }}
    />
    <Stack.Screen 
      name="EventDetails" 
      component={EventDetailsScreen}
      options={{ title: 'Event Details' }}
    />
    <Stack.Screen
      name="QRCodeViewer"
      component={QRCodeViewer}
      options={{ title: 'QR Code' }}
    />
    <Stack.Screen
      name="Payment"
      component={PaymentScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Events" 
      component={EventsScreen}
      options={{ title: 'Events' }}
    />
    <Stack.Screen 
      name="EditCourse" 
      component={EditCourseScreen}
      options={{ title: 'Edit Course' }}
    />
    <Stack.Screen 
      name="EditEvent" 
      component={EditEventScreen}
      options={{ title: 'Edit Event' }}
    />
    <Stack.Screen 
      name="ManageCourseLessons" 
      component={ManageCourseLessonsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="MyCourses" 
      component={MyCoursesScreen}
      options={{ title: 'My Courses' }}
    />
    <Stack.Screen
      name="MyTickets"
      component={MyTicketsScreen}
      options={{ title: 'My Tickets' }}
    />
  </Stack.Navigator>
);

// Courses Stack Navigator
const CoursesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: theme.colors.white,
      headerTitleStyle: {
        fontWeight: theme.typography.fontWeight.bold,
      },
    }}
  >
    <Stack.Screen 
      name="CoursesList" 
      component={CoursesScreen}
      options={{ title: 'Courses' }}
    />
    <Stack.Screen 
      name="CourseDetails" 
      component={CourseDetailsScreen}
      options={{ title: 'Course Details' }}
    />
    <Stack.Screen 
      name="CreateCourse" 
      component={CreateCourseScreen}
      options={{ title: 'Create Course' }}
    />
    <Stack.Screen 
      name="EditCourse" 
      component={EditCourseScreen}
      options={{ title: 'Edit Course' }}
    />
    <Stack.Screen 
      name="ManageCourseLessons" 
      component={ManageCourseLessonsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Events" 
      component={EventsScreen}
      options={{ title: 'Events' }}
    />
    <Stack.Screen 
      name="EventDetails" 
      component={EventDetailsScreen}
      options={{ title: 'Event Details' }}
    />
    <Stack.Screen
      name="Payment"
      component={PaymentScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="QRCodeViewer"
      component={QRCodeViewer}
      options={{ title: 'QR Code' }}
    />
  </Stack.Navigator>
);

// Events Stack Navigator
const EventsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: theme.colors.white,
      headerTitleStyle: {
        fontWeight: theme.typography.fontWeight.bold,
      },
    }}
  >
    <Stack.Screen 
      name="EventsList" 
      component={EventsScreen}
      options={{ title: 'Events' }}
    />
    <Stack.Screen 
      name="EventDetails" 
      component={EventDetailsScreen}
      options={{ title: 'Event Details' }}
    />
    <Stack.Screen 
      name="CreateEvent" 
      component={CreateEventScreen}
      options={{ title: 'Create Event' }}
    />
    <Stack.Screen 
      name="EditEvent" 
      component={EditEventScreen}
      options={{ title: 'Edit Event' }}
    />
    <Stack.Screen
      name="Payment"
      component={PaymentScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="QRCodeViewer"
      component={QRCodeViewer}
      options={{ title: 'QR Code' }}
    />
  </Stack.Navigator>
);

// Timeline Stack Navigator
const TimelineStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: theme.colors.white,
      headerTitleStyle: {
        fontWeight: theme.typography.fontWeight.bold,
      },
    }}
  >
    <Stack.Screen 
      name="TimelineFeed" 
      component={TimelineScreen}
      options={{ title: 'Timeline' }}
    />
    <Stack.Screen 
      name="PostDetails" 
      component={PostDetailsScreen}
      options={{ title: 'Post Details' }}
    />
    <Stack.Screen 
      name="CreatePost" 
      component={CreatePostScreen}
      options={{ 
        title: 'Create Post',
        presentation: 'modal'
      }}
    />
  </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: theme.colors.white,
      headerTitleStyle: {
        fontWeight: theme.typography.fontWeight.bold,
      },
    }}
  >
    <Stack.Screen 
      name="UserProfile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <Stack.Screen 
      name="MyCourses" 
      component={MyCoursesScreen}
      options={{ title: 'My Courses' }}
    />
    <Stack.Screen
      name="MyTickets"
      component={MyTicketsScreen}
      options={{ title: 'My Tickets' }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CoursePlayer" 
      component={CoursePlayerScreen}
      options={{ title: 'Course Player' }}
    />
    <Stack.Screen 
      name="EditProfile" 
      component={EditProfileScreen}
      options={{ title: 'Edit Profile' }}
    />
    <Stack.Screen 
      name="ChangePassword" 
      component={ChangePasswordScreen}
      options={{ title: 'Change Password' }}
    />
    <Stack.Screen
      name="AdminUsers"
      component={AdminUsersScreen}
      options={{ title: 'Manage Users' }}
    />
    <Stack.Screen
      name="Orders"
      component={OrdersScreen}
      options={{ title: 'Orders' }}
    />
    <Stack.Screen
      name="QRScanner"
      component={QRScannerScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="QRCodeViewer"
      component={QRCodeViewer}
      options={{ title: 'QR Code' }}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'HomeTab') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'CoursesTab') {
          iconName = focused ? 'school' : 'school-outline';
        } else if (route.name === 'EventsTab') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'TimelineTab') {
          iconName = focused ? 'grid' : 'grid-outline';
        } else if (route.name === 'ProfileTab') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.gray[500],
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.medium,
      },
    })}
  >
    <Tab.Screen 
      name="HomeTab" 
      component={HomeStack}
      options={{ title: 'Home' }}
    />
    <Tab.Screen 
      name="CoursesTab" 
      component={CoursesStack}
      options={{ title: 'Courses' }}
    />
    <Tab.Screen 
      name="EventsTab" 
      component={EventsStack}
      options={{ title: 'Events' }}
    />
    <Tab.Screen 
      name="TimelineTab" 
      component={TimelineStack}
      options={{ title: 'Timeline' }}
    />
    <Tab.Screen 
      name="ProfileTab" 
      component={ProfileStack}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

// Root Navigator with Auth Modal
const RootStack = createStackNavigator();

const Navigation = ({ isAuthenticated, onAuthChange }) => {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={MainTabs} />
        <RootStack.Group screenOptions={{ presentation: 'modal' }}>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Register" component={RegisterScreen} />
          <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <RootStack.Screen 
            name="PrivacyPolicy" 
            component={PrivacyPolicyScreen}
            options={{ title: 'Privacy Policy', headerShown: true }}
          />
          <RootStack.Screen 
            name="TermsConditions" 
            component={TermsConditionsScreen}
            options={{ title: 'Terms & Conditions', headerShown: true }}
          />
          <RootStack.Screen name="QRCodeViewer" component={QRCodeViewer} />
        </RootStack.Group>
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
