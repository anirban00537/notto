import React, { forwardRef, useImperativeHandle, useRef } from "react";
import BottomSheet, {
  BottomSheetView,
  BottomSheetProps,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

interface CommonBottomSheetProps extends Partial<BottomSheetProps> {
  visible?: boolean;
  onClose?: () => void;
  snapPoints?: (number | string)[];
  children: React.ReactNode;
  backgroundStyle?: object;
  handleIndicatorStyle?: object;
}

const CommonBottomSheet = forwardRef<BottomSheet, CommonBottomSheetProps>(
  (
    {
      visible = false,
      onClose,
      snapPoints = [1, 320],
      children,
      backgroundStyle = { backgroundColor: "#fff" },
      handleIndicatorStyle = { backgroundColor: "#ccc" },
      ...rest
    },
    ref
  ) => {
    const internalRef = useRef<BottomSheet>(null);

    // Expose imperative methods
    useImperativeHandle(ref, () => internalRef.current as BottomSheet, []);

    React.useEffect(() => {
      if (!internalRef.current) return;
      if (visible) {
        internalRef.current.expand();
      } else {
        internalRef.current.close();
      }
    }, [visible]);

    return (
      <BottomSheet
        ref={internalRef}
        index={visible ? 1 : -1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={backgroundStyle}
        handleIndicatorStyle={handleIndicatorStyle}
        onClose={onClose}
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop
            {...backdropProps}
            appearsOnIndex={1}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
        {...rest}
      >
        <BottomSheetView>{children}</BottomSheetView>
      </BottomSheet>
    );
  }
);

export default CommonBottomSheet;
