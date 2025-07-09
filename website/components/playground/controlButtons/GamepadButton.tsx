import GlassButton from "./GlassButton";
import { RiGamepadLine } from "@remixicon/react";

interface GamepadControlButtonProps {
  gamepadEnabled: boolean;
  onToggleGamepad: () => void;
}

export default function GamepadControlButton({
  gamepadEnabled,
  onToggleGamepad,
}: GamepadControlButtonProps) {
  return (
    <GlassButton
      onClick={onToggleGamepad}
      icon={<RiGamepadLine size={20} />}
      tooltip="Toggle Gamepad Control"
      pressed={gamepadEnabled}
    />
  );
}
