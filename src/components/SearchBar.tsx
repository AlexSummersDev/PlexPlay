import React, { useState, useRef } from "react";
import { View, TextInput, Pressable, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../utils/cn";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: (text: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
  className?: string;
}

export default function SearchBar({
  placeholder = "Search movies and TV shows...",
  value,
  onChangeText,
  onSubmit,
  onClear,
  onFocus,
  onBlur,
  autoFocus = false,
  editable = true,
  className,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit?.(value.trim());
      Keyboard.dismiss();
    }
  };

  const handleClear = () => {
    onChangeText("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <View 
      className={cn(
        "flex-row items-center bg-gray-800 rounded-xl px-4 py-3 mx-4",
        isFocused && "bg-gray-700 border border-blue-500/50",
        !editable && "opacity-60",
        className
      )}
    >
      <Ionicons 
        name="search" 
        size={20} 
        color={isFocused ? "#60A5FA" : "#9CA3AF"} 
      />
      
      <TextInput
        ref={inputRef}
        className="flex-1 text-white text-base ml-3 mr-2"
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        autoFocus={autoFocus}
        editable={editable}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never" // We'll handle this manually
      />
      
      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          className="p-1"
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <Ionicons name="close-circle" size={20} color="#6B7280" />
        </Pressable>
      )}
    </View>
  );
}