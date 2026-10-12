public class button_next_ : LegacyButton
{
    protected override string PressedParameter { get { return "pressed2"; } }

    protected override int TargetScene()
    {
        return SceneOrCurrent(null, Current() + 1);
    }
}
