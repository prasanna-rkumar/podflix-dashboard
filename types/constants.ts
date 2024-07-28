import { z } from "zod";
export const COMP_NAME = "PodFlix";

export const SubtitleWordType = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number()
});

export const CompositionProps = z.object({
  captions: z.array(z.object({
    start: z.number(),
    end: z.number(),
    words: z.array(SubtitleWordType),
  })),
  audio_url: z.string(),
  episode_art: z.string(),
  episode_title: z.string(),
});

export const defaultCompositionProps: z.infer<typeof CompositionProps> = {
  episode_art: "https://upload.wikimedia.org/wikipedia/en/7/7f/Avatar_The_Last_Airbender.png",
  episode_title: "The Last Airbender",
  audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  captions: [
    {
      start: 0,
      end: 2,
      words: [
        {
          start: 0,
          end: 1,
          word: "Hello"
        },
        {
          start: 1,
          end: 2,
          word: "World"
        }
      ]
    }
  ]
}

export const DURATION_IN_FRAMES = 24 * 60;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1080;
export const VIDEO_FPS = 24;
