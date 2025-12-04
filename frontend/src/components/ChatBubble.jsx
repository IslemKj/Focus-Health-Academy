/**
 * ChatBubble component
 * Displays a chat message bubble
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import theme from '../theme';

const ChatBubble = ({ message, isOwnMessage, showAvatar = true }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.container_own : styles.container_other,
      ]}
    >
      {!isOwnMessage && showAvatar && (
        <Image
          source={{
            uri: message.sender.avatar || 'https://via.placeholder.com/40',
          }}
          style={styles.avatar}
        />
      )}

      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.bubble_own : styles.bubble_other,
          !showAvatar && !isOwnMessage && styles.bubble_noAvatar,
        ]}
      >
        {!isOwnMessage && (
          <Text style={styles.senderName}>
            {message.sender.first_name} {message.sender.last_name}
          </Text>
        )}

        <Text
          style={[
            styles.content,
            isOwnMessage ? styles.content_own : styles.content_other,
          ]}
        >
          {message.content}
        </Text>

        {message.image && (
          <Image
            source={{ uri: message.image }}
            style={styles.messageImage}
            resizeMode="cover"
          />
        )}

        <Text
          style={[
            styles.time,
            isOwnMessage ? styles.time_own : styles.time_other,
          ]}
        >
          {formatTime(message.created_at)}
        </Text>
      </View>

      {isOwnMessage && showAvatar && (
        <Image
          source={{
            uri: message.sender.avatar || 'https://via.placeholder.com/40',
          }}
          style={styles.avatar}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  container_own: {
    justifyContent: 'flex-end',
  },
  container_other: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: theme.spacing.sm,
  },
  bubble: {
    maxWidth: '70%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  bubble_own: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.borderRadius.sm,
  },
  bubble_other: {
    backgroundColor: theme.colors.gray[200],
    borderBottomLeftRadius: theme.borderRadius.sm,
  },
  bubble_noAvatar: {
    marginLeft: 52, // avatar width + margin
  },
  senderName: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  content: {
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
  },
  content_own: {
    color: theme.colors.white,
  },
  content_other: {
    color: theme.colors.text.primary,
  },
  messageImage: {
    width: '100%',
    height: 150,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  time: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  time_own: {
    color: theme.colors.white,
    opacity: 0.8,
  },
  time_other: {
    color: theme.colors.text.secondary,
  },
});

export default ChatBubble;
