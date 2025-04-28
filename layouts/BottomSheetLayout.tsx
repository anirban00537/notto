import React, { useRef } from 'react';
import { Stack } from 'expo-router';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

export default function BottomSheetLayout({ children }: { children?: React.ReactNode }) {
  // Snap points for closed and open
  const snapPoints = [1, '60%'];
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: '#fff' }}
      handleIndicatorStyle={{ backgroundColor: '#ccc' }}
    >
      <BottomSheetView style={{ flex: 1 }}>
        {/* If using React Navigation inside sheet: */}
        <Stack
          screenOptions={{
            safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
          }}
        />
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
}
