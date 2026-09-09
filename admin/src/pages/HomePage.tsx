import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Field,
  Flex,
  Grid,
  Loader,
  Main,
  Switch,
  TextInput,
  Typography,
} from "@strapi/design-system";
import { Check } from "@strapi/icons";
import { getFetchClient } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";

import { DEFAULT_THEME, type ThemeSettings } from "../../../shared/theme";
import { PLUGIN_ID } from "../pluginId";
import { getTranslation } from "../utils/getTranslation";
import { writeCachedTheme } from "../utils/applyTheme";
import { fetchTheme } from "../utils/fetchTheme";

/** A colour token: swatch, hex input and a native picker. */
const ColorField = ({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
}) => (
  <Field.Root name={name}>
    <Field.Label>{label}</Field.Label>
    <Flex gap={2} alignItems="center">
      <input
        type="color"
        aria-label={`${label} picker`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: 40,
          height: 36,
          padding: 2,
          border: "1px solid var(--neutral200, #dcdce4)",
          borderRadius: 4,
          background: "transparent",
          cursor: "pointer",
        }}
      />
      <Box grow={1}>
        <TextInput
          name={name}
          value={value}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onChange(event.target.value)
          }
        />
      </Box>
    </Flex>
  </Field.Root>
);

/**
 * Edit the admin palette.
 *
 * The Theme Settings single type is hidden from the Content Manager — that list is for
 * content, not platform configuration — so this page is where the colours are edited.
 */
const HomePage = () => {
  const { formatMessage } = useIntl();

  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [draft, setDraft] = useState<ThemeSettings>(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const loaded = (await fetchTheme()) ?? DEFAULT_THEME;
      setTheme(loaded);
      setDraft(loaded);
    })();
  }, []);

  const set = <Key extends keyof ThemeSettings>(key: Key, value: ThemeSettings[Key]) => {
    setDraft((state) => ({ ...state, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);

    try {
      const { data } = await getFetchClient().put<{ data: ThemeSettings }>(
        `/${PLUGIN_ID}/settings`,
        {
          enabled: draft.enabled,
          primaryColor: draft.primaryColor,
          secondaryColor: draft.secondaryColor,
          dangerColor: draft.dangerColor,
          successColor: draft.successColor,
        }
      );

      setTheme(data.data);
      setDraft(data.data);
      /*
       * Refresh the cache so the next reload paints with these colours.
       *
       * This is also the only path that reliably fills the cache: the plugin's `bootstrap`
       * tries, but it runs before the panel renders and therefore before an access token
       * exists, so its request comes back 401.
       */
      writeCachedTheme(data.data);
      setSaved(true);
      setError(null);
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (theme === null) {
    return (
      <Main>
        <Box padding={8}>
          <Loader>Loading theme</Loader>
        </Box>
      </Main>
    );
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(theme);

  return (
    <Main>
      <Box padding={8}>
        <Flex justifyContent="space-between" alignItems="flex-start" marginBottom={6}>
          <Box paddingRight={6}>
            <Typography variant="alpha" tag="h1">
              {formatMessage({
                id: getTranslation("plugin.name"),
                defaultMessage: "Theme",
              })}
            </Typography>
            <Box paddingTop={2}>
              <Typography variant="epsilon" textColor="neutral600">
                Each colour fills a five-stop Strapi ramp, so it reaches every button, input,
                card and badge in the admin at once. The tokens are read when the panel
                renders, so a change appears on the next reload.
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<Check />}
            loading={saving}
            disabled={!dirty}
            onClick={save}
          >
            Save
          </Button>
        </Flex>

        {error ? (
          <Box paddingBottom={4}>
            <Typography textColor="danger600">{error}</Typography>
          </Box>
        ) : null}

        {saved ? (
          <Box paddingBottom={4}>
            <Typography textColor="success600">
              Saved — reload the panel to see the new colours.
            </Typography>
          </Box>
        ) : null}

        <Box
          padding={6}
          hasRadius
          background="neutral0"
          borderColor="neutral150"
          borderStyle="solid"
          borderWidth="1px"
        >
          <Grid.Root gap={5}>
            <Grid.Item col={6} s={12} direction="column" alignItems="stretch">
              <ColorField
                name="primaryColor"
                label="Primary"
                value={draft.primaryColor}
                onChange={(value) => set("primaryColor", value)}
              />
            </Grid.Item>
            <Grid.Item col={6} s={12} direction="column" alignItems="stretch">
              <ColorField
                name="secondaryColor"
                label="Secondary"
                value={draft.secondaryColor}
                onChange={(value) => set("secondaryColor", value)}
              />
            </Grid.Item>
            <Grid.Item col={6} s={12} direction="column" alignItems="stretch">
              <ColorField
                name="dangerColor"
                label="Danger"
                value={draft.dangerColor}
                onChange={(value) => set("dangerColor", value)}
              />
            </Grid.Item>
            <Grid.Item col={6} s={12} direction="column" alignItems="stretch">
              <ColorField
                name="successColor"
                label="Success"
                value={draft.successColor}
                onChange={(value) => set("successColor", value)}
              />
            </Grid.Item>

            <Grid.Item col={12} direction="column" alignItems="stretch">
              <Field.Root
                name="enabled"
                hint="Off reverts to Strapi's palette without discarding these colours"
              >
                <Field.Label>Theme enabled</Field.Label>
                <Switch
                  checked={draft.enabled}
                  onCheckedChange={(checked: boolean) => set("enabled", checked)}
                />
                <Field.Hint />
              </Field.Root>
            </Grid.Item>
          </Grid.Root>

          {draft.logoUrl ? (
            <Box marginTop={6}>
              <Typography variant="sigma" textColor="neutral600">
                Logo
              </Typography>
              <Box marginTop={2}>
                <img src={draft.logoUrl} alt="Brand logo" style={{ maxHeight: 64 }} />
              </Box>
            </Box>
          ) : null}
        </Box>

        <Box paddingTop={4}>
          <Typography variant="pi" textColor="neutral600">
            Logo and favicon are media fields on the Theme Settings single type; upload them
            in the Media Library and attach them through the API. The logo is then used in
            the navigation and on the login screen.
          </Typography>
        </Box>
      </Box>
    </Main>
  );
};

export { HomePage };
