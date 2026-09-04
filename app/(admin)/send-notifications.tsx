import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { adminSendCustomNotification } from "../../hooks/api";

type TargetMode = "all" | "specific";

export default function SendNotificationScreen() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [targetMode, setTargetMode] = useState<TargetMode>("all");
  const [targetsText, setTargetsText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!body.trim()) e.body = "Message body is required";
    if (targetMode === "specific" && !targetsText.trim()) {
      e.targets = "Enter at least one user ID or email";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = () => {
    if (sending) return;
    if (!validate()) return;

    const targetList =
      targetMode === "specific"
        ? targetsText
            .split(/[\n,]/)
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

    Alert.alert(
      "Send notification?",
      targetMode === "all"
        ? "This will be sent to every user on the platform."
        : `This will be sent to ${targetList.length} recipient${targetList.length === 1 ? "" : "s"}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async () => {
            setSending(true);
            try {
              await adminSendCustomNotification({
                title: title.trim(),
                body: body.trim(),
                targets: targetMode === "all" ? "all" : targetList,
                url: url.trim() || undefined,
              });
              Alert.alert("Sent", "Notification dispatched successfully.", [
                {
                  text: "View history",
                  onPress: () => router.replace("/(admin)/sent-notifications"),
                },
                { text: "Done", onPress: () => router.back() },
              ]);
            } catch (err: any) {
              Alert.alert("Error", err?.response?.data?.message || "Failed to send");
            } finally {
              setSending(false);
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="pt-14 px-5 pb-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mb-4 self-start">
            <Ionicons name="arrow-back" size={22} color="#10b981" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-2xl font-semibold">Send Notification</Text>
          <Text className="text-gray-400 text-sm mt-1">
            Push a message to all users or a specific list
          </Text>
        </View>

        <View className="px-5 pt-5 pb-10">
          <Input
            label="Title"
            placeholder="e.g. New feature: AI search"
            leftIcon="text-outline"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
          />

          <Input
            label="Message"
            placeholder="What do you want to tell them?"
            leftIcon="chatbox-ellipses-outline"
            value={body}
            onChangeText={setBody}
            error={errors.body}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />

          <Input
            label="Link (optional)"
            placeholder="/dashboard/some-page"
            leftIcon="link-outline"
            value={url}
            onChangeText={setUrl}
          />

          <Text className="text-gray-500 text-xs font-medium mb-2 ml-0.5 mt-1">
            Recipients
          </Text>
          <View className="flex-row gap-2 mb-3">
            {(["all", "specific"] as TargetMode[]).map((mode) => {
              const active = targetMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setTargetMode(mode)}
                  className={`flex-1 items-center py-2.5 rounded-xl border ${
                    active ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${active ? "text-white" : "text-gray-600"}`}
                  >
                    {mode === "all" ? "All Users" : "Specific"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {targetMode === "specific" && (
            <Input
              label="User IDs or emails"
              placeholder={"One per line, or comma-separated\ne.g. user-005, sadia.islam@ruet.ac.bd"}
              leftIcon="people-outline"
              value={targetsText}
              onChangeText={setTargetsText}
              error={errors.targets}
              multiline
              numberOfLines={4}
              style={{ minHeight: 90, textAlignVertical: "top" }}
            />
          )}

          <View className="flex-row items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6 mt-2">
            <Ionicons name="warning-outline" size={14} color="#d97706" style={{ marginTop: 1 }} />
            <Text className="text-amber-700 text-xs flex-1 leading-5">
              This only creates in-app notifications (visible in each user's Notifications
              screen) — it does not send a push alert to their device. See the notes on
              push tokens for that.
            </Text>
          </View>

          <Button
            label="Send notification"
            onPress={handleSend}
            loading={sending}
            size="lg"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}