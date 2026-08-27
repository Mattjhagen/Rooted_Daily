import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { useBookmarksStore } from '../features/bible/bookmarksStore';
import { colors } from '../theme/colors';

interface BookmarkButtonProps {
  reference: string;
  color: string;
  size?: number;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ reference, color, size = 20 }) => {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarksStore();
  const bookmarked = isBookmarked(reference);

  const toggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(reference);
    } else {
      addBookmark(reference);
    }
  };

  return (
    <TouchableOpacity onPress={toggleBookmark} style={styles.btn}>
      <Bookmark 
        size={size} 
        color={bookmarked ? colors.accent : color} 
        fill={bookmarked ? colors.accent : 'transparent'} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
