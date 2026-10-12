public class button_restart_ : LegacyButton
{
    protected override string PressedParameter { get { return "pressed_r"; } }

    protected override int TargetScene()
    {
        return Current();
    }
}
