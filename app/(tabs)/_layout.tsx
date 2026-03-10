import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted && !session) {
        router.replace("/(tabs)/authenticate");
      }
    };

    checkAuth();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/(tabs)/authenticate");
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <Tabs
      initialRouteName="authenticate"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: route.name === "authenticate" ? { display: "none" } : {},
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Jobb Notater",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="authenticate"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ViewNoteScreen"
        // ...existing code...
      />
      <Tabs.Screen
        name="AddNoteScreen"
        // ...existing code...
      />
    </Tabs>
  );
}
