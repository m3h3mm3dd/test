import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../Hooks/UseAuth';
import { AuthNavigator } from './AuthNavigator';
import { DashboardNavigator } from './DashboardNavigator';
import { OnboardingScreen } from '../Screens/Onboarding/OnboardingScreen';
import { StorageUtils } from '../Utils/StorageUtils';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { userToken, user } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkOnboardingStatus = async () => {
      const status = await StorageUtils.getOnboardingStatus();
      setHasCompletedOnboarding(status);
    };

    checkOnboardingStatus();
  }, []);

  if (hasCompletedOnboarding === null) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      {!userToken ? (
        <>
          {!hasCompletedOnboarding && (
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen} 
            />
          )}
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator} 
          />
        </>
      ) : (
        <Stack.Screen 
          name="Main" 
          component={DashboardNavigator} 
        />
      )}
    </Stack.Navigator>
  );
};