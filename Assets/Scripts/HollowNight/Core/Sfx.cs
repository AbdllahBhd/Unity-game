using System;
using System.Collections.Generic;
using UnityEngine;

namespace HollowNight
{
    public enum Sound
    {
        Click, Launch, Bounce, Land, Candy, Key, Dash, Flap, Smash, Break, Hurt, Portal, Cannon,
        Star, Win, BossHit, Type, Web, Mushroom, Unlock
    }

    /// <summary>
    /// All audio is synthesised at runtime, so the project needs no audio files.
    /// Clips are generated lazily the first time they are played.
    /// </summary>
    public class Sfx : MonoBehaviour
    {
        const int Rate = 22050;
        const float Tau = Mathf.PI * 2f;

        static Sfx instance;
        readonly Dictionary<Sound, AudioClip> clips = new Dictionary<Sound, AudioClip>();
        AudioSource effects;
        AudioSource music;
        System.Random random = new System.Random(7);

        public static Sfx Instance
        {
            get
            {
                if (instance == null)
                {
                    GameObject go = new GameObject("HN_Audio");
                    DontDestroyOnLoad(go);
                    instance = go.AddComponent<Sfx>();
                    instance.Build();
                }
                return instance;
            }
        }

        public static void Play(Sound sound, float volume = 1f, float pitch = 1f)
        {
            Instance.PlayClip(sound, volume, pitch);
        }

        public static void StartMusic()
        {
            Instance.EnsureMusic();
        }

        public static void ApplySettings()
        {
            Instance.Apply();
        }

        void Build()
        {
            effects = gameObject.AddComponent<AudioSource>();
            effects.playOnAwake = false;
            music = gameObject.AddComponent<AudioSource>();
            music.playOnAwake = false;
            music.loop = true;
            music.volume = 0.32f;
            Apply();
        }

        void Apply()
        {
            bool on = Progress.SoundOn;
            effects.mute = !on;
            music.mute = !on;
        }

        void EnsureMusic()
        {
            if (music.clip == null) music.clip = BuildMusic();
            if (!music.isPlaying) music.Play();
        }

        void PlayClip(Sound sound, float volume, float pitch)
        {
            if (!Progress.SoundOn) return;
            AudioClip clip;
            if (!clips.TryGetValue(sound, out clip) || clip == null)
            {
                clip = BuildClip(sound);
                clips[sound] = clip;
            }
            effects.pitch = pitch;
            effects.PlayOneShot(clip, volume);
        }

        // ------------------------------------------------------------------ synthesis helpers
        AudioClip Make(string clipName, float duration, Func<float, float, float> sample)
        {
            int count = Mathf.Max(1, (int)(duration * Rate));
            float[] data = new float[count];
            for (int i = 0; i < count; i++)
            {
                float t = i / (float)Rate;
                data[i] = Mathf.Clamp(sample(t, t / duration), -1f, 1f);
            }
            // short fade out to avoid clicks
            int fade = Mathf.Min(count, Rate / 200);
            for (int i = 0; i < fade; i++) data[count - 1 - i] *= i / (float)fade;
            AudioClip clip = AudioClip.Create(clipName, count, 1, Rate, false);
            clip.SetData(data, 0);
            return clip;
        }

        float Noise()
        {
            return (float)(random.NextDouble() * 2.0 - 1.0);
        }

        static float Sine(float phase)
        {
            return Mathf.Sin(phase * Tau);
        }

        static float Decay(float t, float rate)
        {
            return Mathf.Exp(-t * rate);
        }

        /// <summary>Sine whose frequency slides from f0 to f1 over the duration.</summary>
        static float Sweep(float t, float duration, float f0, float f1)
        {
            float k = (f1 - f0) / duration;
            return Mathf.Sin(Tau * (f0 * t + 0.5f * k * t * t));
        }

        static float Bell(float t, float frequency, float rate)
        {
            if (t < 0f) return 0f;
            return (Sine(frequency * t) + 0.35f * Sine(frequency * 2.01f * t) + 0.15f * Sine(frequency * 3.02f * t)) * Decay(t, rate) * 0.6f;
        }

        AudioClip BuildClip(Sound sound)
        {
            float low = 0f;
            switch (sound)
            {
                case Sound.Click:
                    return Make("click", 0.08f, (t, n) => Sine(720f * t) * Decay(t, 45f) * 0.6f);
                case Sound.Type:
                    return Make("type", 0.03f, (t, n) => Sine(980f * t) * Decay(t, 90f) * 0.25f);
                case Sound.Launch:
                    return Make("launch", 0.3f, (t, n) =>
                    {
                        low += (Noise() - low) * 0.25f;
                        return (low * 0.6f + Sweep(t, 0.3f, 220f, 620f) * 0.35f) * Mathf.Sin(n * Mathf.PI);
                    });
                case Sound.Dash:
                    return Make("dash", 0.28f, (t, n) =>
                    {
                        low += (Noise() - low) * 0.5f;
                        return (low * 0.5f + Sweep(t, 0.28f, 500f, 1400f) * 0.3f) * (1f - n);
                    });
                case Sound.Flap:
                    return Make("flap", 0.16f, (t, n) =>
                    {
                        low += (Noise() - low) * 0.12f;
                        return low * 1.6f * Mathf.Sin(n * Mathf.PI);
                    });
                case Sound.Bounce:
                    return Make("bounce", 0.14f, (t, n) => Sweep(t, 0.14f, 190f, 90f) * Decay(t, 22f) * 0.8f);
                case Sound.Land:
                    return Make("land", 0.12f, (t, n) =>
                    {
                        low += (Noise() - low) * 0.08f;
                        return (low * 1.4f + Sweep(t, 0.12f, 120f, 60f) * 0.5f) * Decay(t, 30f);
                    });
                case Sound.Mushroom:
                    return Make("mushroom", 0.3f, (t, n) => Sweep(t, 0.3f, 180f, 760f) * Decay(t, 9f) * 0.6f);
                case Sound.Candy:
                    return Make("candy", 0.35f, (t, n) => Bell(t, 880f, 12f) + Bell(t - 0.08f, 1320f, 12f));
                case Sound.Star:
                    return Make("star", 0.5f, (t, n) => Bell(t, 1046f, 8f) + Bell(t - 0.06f, 1568f, 8f));
                case Sound.Key:
                    return Make("key", 0.5f, (t, n) => Bell(t, 660f, 10f) + Bell(t - 0.1f, 880f, 10f) + Bell(t - 0.2f, 1320f, 9f));
                case Sound.Unlock:
                    return Make("unlock", 0.7f, (t, n) => Bell(t, 523f, 7f) + Bell(t - 0.12f, 784f, 7f) + Bell(t - 0.24f, 1046f, 6f));
                case Sound.Win:
                    return Make("win", 1.3f, (t, n) =>
                        Bell(t, 523f, 5f) + Bell(t - 0.14f, 659f, 5f) + Bell(t - 0.28f, 784f, 5f) + Bell(t - 0.42f, 1046f, 3.5f)
                        + Bell(t - 0.42f, 1318f, 3.5f) * 0.6f);
                case Sound.Smash:
                    return Make("smash", 0.45f, (t, n) =>
                    {
                        low += (Noise() - low) * 0.1f;
                        return (low * 1.8f + Sweep(t, 0.45f, 90f, 35f) * 0.8f) * Decay(t, 8f);
                    });
                case Sound.Break:
                    return Make("break", 0.3f, (t, n) =>
                    {
                        low += (Noise() - low) * 0.4f;
                        float crackle = random.NextDouble() < 0.02 ? 1f : 0f;
                        return (low * 0.8f + crackle * 0.5f + Sweep(t, 0.3f, 300f, 120f) * 0.2f) * Decay(t, 12f);
                    });
                case Sound.Hurt:
                    return Make("hurt", 0.4f, (t, n) =>
                    {
                        float saw = 2f * ((t * Mathf.Lerp(420f, 110f, n)) % 1f) - 1f;
                        return saw * 0.35f * (1f - n);
                    });
                case Sound.Portal:
                    return Make("portal", 0.45f, (t, n) =>
                        Sine(t * (520f + 160f * Sine(t * 14f))) * Mathf.Sin(n * Mathf.PI) * 0.45f);
                case Sound.Cannon:
                    return Make("cannon", 0.5f, (t, n) =>
                    {
                        low += (Noise() - low) * 0.06f;
                        return (low * 2f + Sweep(t, 0.5f, 110f, 40f)) * Decay(t, 7f) * 0.8f;
                    });
                case Sound.BossHit:
                    return Make("bosshit", 0.6f, (t, n) =>
                        (Sine(t * 196f) + Sine(t * 277f) + Sine(t * 415f)) * 0.25f * Decay(t, 6f)
                        + Sweep(t, 0.6f, 900f, 200f) * 0.2f * (1f - n));
                case Sound.Web:
                    return Make("web", 0.2f, (t, n) => Sweep(t, 0.2f, 1500f, 500f) * (1f - n) * 0.35f);
                default:
                    return Make("silence", 0.05f, (t, n) => 0f);
            }
        }

        // ------------------------------------------------------------------ music
        static float Note(int semitonesFromA4)
        {
            return 440f * Mathf.Pow(2f, semitonesFromA4 / 12f);
        }

        /// <summary>Adds a decaying note into a looping buffer (wraps around the end so the loop is seamless).</summary>
        static void AddNote(float[] buffer, float start, float length, float frequency, float volume, float decay, int shape)
        {
            int begin = (int)(start * Rate);
            int count = (int)(length * Rate);
            for (int i = 0; i < count; i++)
            {
                float t = i / (float)Rate;
                float phase = frequency * t;
                float wave;
                if (shape == 0) wave = Mathf.Sin(phase * Tau);
                else if (shape == 1) wave = 2f * Mathf.Abs(2f * (phase - Mathf.Floor(phase + 0.5f))) - 1f; // triangle
                else wave = Mathf.Sin(phase * Tau + 2.5f * Mathf.Sin(phase * Tau * 0.5f) * Mathf.Exp(-t * 3f)); // soft fm
                float attack = Mathf.Clamp01(t * 60f);
                float release = Mathf.Clamp01((length - t) * 20f);
                buffer[(begin + i) % buffer.Length] += wave * volume * attack * release * Mathf.Exp(-t * decay);
            }
        }

        AudioClip BuildMusic()
        {
            const float beat = 60f / 92f;
            const int bars = 8;
            float total = bars * 4 * beat;
            float[] data = new float[(int)(total * Rate)];

            // A minor, F major, C major, E major: two bars each.
            int[][] chords =
            {
                new[] { -12, -9, -5 }, new[] { -16, -12, -9 }, new[] { -9, -5, -2 }, new[] { -17, -13, -10 }
            };
            int[] melody = { 0, 3, 7, 3, 8, 7, 3, 0, 3, 7, 12, 7, 11, 8, 4, 2 };

            for (int bar = 0; bar < bars; bar++)
            {
                int[] chord = chords[bar / 2];
                float barStart = bar * 4 * beat;
                AddNote(data, barStart, beat * 3.8f, Note(chord[0] - 24), 0.22f, 0.6f, 1);
                AddNote(data, barStart + beat * 2f, beat * 1.9f, Note(chord[0] - 12), 0.1f, 1.2f, 1);
                for (int step = 0; step < 8; step++)
                {
                    int tone = chord[step % 3] + (step >= 4 ? 12 : 0);
                    AddNote(data, barStart + step * beat * 0.5f, beat * 0.9f, Note(tone), 0.07f, 5f, 2);
                }
                for (int step = 0; step < 2; step++)
                {
                    int index = (bar * 2 + step) % melody.Length;
                    AddNote(data, barStart + step * beat * 2f, beat * 1.9f, Note(melody[index]), 0.06f, 1.4f, 0);
                }
            }

            float peak = 0.001f;
            for (int i = 0; i < data.Length; i++) peak = Mathf.Max(peak, Mathf.Abs(data[i]));
            float gain = 0.85f / peak;
            for (int i = 0; i < data.Length; i++) data[i] *= gain;

            AudioClip clip = AudioClip.Create("hollow_night_theme", data.Length, 1, Rate, false);
            clip.SetData(data, 0);
            return clip;
        }
    }
}
