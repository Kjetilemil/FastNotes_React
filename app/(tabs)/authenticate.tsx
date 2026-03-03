import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";


export default function Authenticate() {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const SignUpLogic = async () => {
        if (!email.trim() || !password.trim()) {
            alert("Email and password cannot be empty.");
            return;
        }
        const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password.trim(),
        });
        if (error) {
            alert(error.message);
            return;
        }
        alert("Signed up!");
        router.replace("/(tabs)");
    };

    const LoginLogic = async () => {
        if (!email.trim() || !password.trim()) {
            alert("Email and password cannot be empty.");
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
        });
        setLoading(false);
        if (error) {
            alert(error.message);
            return;
        }
        alert("Logged in!");
        router.replace("/(tabs)");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerStyle}>FastNotes</Text>  
            <Text>Log in or sign up to continue</Text> 
            <TextInput
                style={styles.inputStyle}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.inputStyle}
                placeholder="Password"
                value={password}    
                onChangeText={setPassword}
                secureTextEntry
            />
            <View style={styles.firstButtonStyle}>  
                <Button title="Sign Up" onPress={SignUpLogic} disabled={loading} />
            </View>
            <View style={styles.buttonPlacementStyle}>
                <Button title="Log In" onPress={LoginLogic} disabled={loading} />
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,    
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 250,   
    },
    headerStyle: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 20,
    },  
    inputStyle: {
        width: "80%",
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,  
        marginBottom: 15,
    },
    firstButtonStyle: {
        marginTop: 140,
    },
    buttonPlacementStyle: {
        marginTop: 10,
    },
}); 