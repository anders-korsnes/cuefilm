export type Theme = "dark" | "light" | "system";

export type AppLanguage = "no" | "en";

export type Gender = "male" | "female" | "other" | "prefer-not-to-say";

export type UserProfile = {
  name: string;
  email: string;
  username: string;
  age: string;
  gender: Gender | null;
  avatarUrl: string | null;
};

export type UserSettings = {
  theme: Theme;
  appLanguage: AppLanguage;
  profile: UserProfile;
};

export const defaultSettings: UserSettings = {
  theme: "dark",
  appLanguage: "no",
  profile: {
    name: "",
    email: "",
    username: "bruker_001",
    age: "",
    gender: null,
    avatarUrl: null,
  },
};
