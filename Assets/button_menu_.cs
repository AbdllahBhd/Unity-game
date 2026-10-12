public class button_menu_ : LegacyButton
{
    protected override string PressedParameter { get { return "pressed_m"; } }

    protected override int TargetScene()
    {
        return SceneOrCurrent("Assets/Scenes/Menu_start.unity", 0);
    }
}
