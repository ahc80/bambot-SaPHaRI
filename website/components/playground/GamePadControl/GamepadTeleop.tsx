import { useEffect, useRef } from "react";

interface GamepadTeleopProps {
  updateJointsDegrees: (updates: { servoId: number; value: number }[]) => void;
  jointMap?: number[]; // optional: maps gamepad axes to servo IDs
}

const GamepadTeleop = ({ updateJointsDegrees, jointMap = [1, 2, 3, 4, 5, 6] }: GamepadTeleopProps) => {
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const pollGamepad = () => {
      const gp = navigator.getGamepads()[0]; // Use first gamepad
      if (gp && gp.connected) {
        const updates = [];

        // Example: Use left stick (axes[0] and [1]) and right stick (axes[2] and [3])
        const axisValues = gp.axes.map((val) => Math.round(val * 90)); // Convert to ±90 deg

        for (let i = 0; i < jointMap.length && i < axisValues.length; i++) {
          const angle = axisValues[i];
          updates.push({ servoId: jointMap[i], value: angle });
        }

        if (updates.length > 0) {
          updateJointsDegrees(updates);
        }
      }

      animationRef.current = requestAnimationFrame(pollGamepad);
    };

    animationRef.current = requestAnimationFrame(pollGamepad);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateJointsDegrees, jointMap]);

  return null; // No UI needed
};

export default GamepadTeleop;
