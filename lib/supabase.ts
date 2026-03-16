import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import "react-native-url-polyfill/auto";

// gather connection credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// encrypted storage for auth session
const secureStore = {
	getItem: (key: string) => SecureStore.getItemAsync(key),
	setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
	removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// export a supabase client we can use across the app
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
	auth: {
		storage: secureStore,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});