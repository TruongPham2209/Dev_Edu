import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export interface FilterItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
}

interface FilterSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  items: FilterItem[];
  defaultLabel?: string;
  defaultValue?: string;
  disabled?: boolean;
}

export function FilterSelect({
  label = "Filter",
  value,
  onChange,
  items,
  defaultLabel,
  defaultValue = "ALL",
  disabled = false,
}: FilterSelectProps) {
  return (
    <FormControl
      disabled={disabled}
      sx={{
        width: { xs: "100%", md: 240 },

        "& .MuiOutlinedInput-root": {
          height: 56,

          borderRadius: "999px",

          bgcolor: "background.paper",

          backdropFilter: "blur(14px)",

          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 4px 20px rgba(0, 0, 0, 0.4)"
              : "0 4px 20px rgba(15,23,42,.05)",

          transition: "all .25s cubic-bezier(.4,0,.2,1)",

          "& fieldset": {
            borderColor: "divider",
            transition: "all .25s cubic-bezier(.4,0,.2,1)",
          },

          "&:hover fieldset": {
            borderColor: "text.secondary",
          },

          "&:hover": {
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 8px 24px rgba(0, 0, 0, 0.5)"
                : "0 8px 24px rgba(15,23,42,.08)",
          },

          "&.Mui-focused fieldset": {
            borderColor: "primary.main",
            borderWidth: "1px",
          },

          "&.Mui-focused": {
            boxShadow: "0 10px 28px rgba(37,99,235,.10)",
            transform: "translateY(-1px)",
          },
        },
      }}
    >
      <InputLabel
        sx={{
          fontSize: "0.95rem",

          fontWeight: 600,

          color: "text.secondary",

          "&.Mui-focused": {
            color: "primary.main",
          },
        }}
      >
        {label}
      </InputLabel>

      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
        renderValue={(selected) => {
          if (defaultLabel && selected === defaultValue) {
            return (
              <Box
                component="span"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                }}
              >
                {defaultLabel}
              </Box>
            );
          }

          const selectedItem = items.find((item) => item.id === selected);
          if (selectedItem) {
            return selectedItem.title;
          }

          return defaultLabel ? (
            <Box
              component="span"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              {defaultLabel}
            </Box>
          ) : (
            selected || ""
          );
        }}
        IconComponent={(props) => (
          <Box
            component="span"
            {...props}
            sx={{
              right: "18px !important",
              top: "50%",
              transform: "translateY(-50%)",
              color: "text.secondary",
              fontSize: 18,
            }}
          >
            ⌄
          </Box>
        )}
        sx={{
          height: 56,

          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",

            px: "20px !important",

            fontSize: "0.95rem",

            fontWeight: 600,

            color: "text.primary",
          },
        }}
        MenuProps={{
          slotProps: {
            paper: {
              elevation: 0,
              sx: {
                mt: 1,

                borderRadius: "20px",

                border: "1px solid",
                borderColor: "divider",

                bgcolor: "background.paper",

                backdropFilter: "blur(20px)",

                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 20px 60px rgba(0,0,0,.6)"
                    : "0 20px 60px rgba(15,23,42,.10)",

                overflow: "hidden",

                "& .MuiMenuItem-root": {
                  minHeight: 44,

                  borderRadius: "12px",

                  mx: 0.75,
                  my: 0.25,

                  fontSize: "0.94rem",

                  fontWeight: 600,

                  color: "text.primary",

                  transition: "all .18s ease",

                  "&:hover": {
                    bgcolor: "action.hover",
                  },

                  "&.Mui-selected": {
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(37,99,235,.2)"
                        : "rgba(37,99,235,.10)",
                    color: "primary.main",

                    "&:hover": {
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(37,99,235,.3)"
                          : "rgba(37,99,235,.14)",
                    },
                  },
                },
              },
            },
          },
        }}
      >
        {defaultLabel && (
          <MenuItem
            value={defaultValue}
            sx={{
              color: "text.secondary",

              "&.Mui-selected": {
                color: "primary.main",
                bgcolor: "action.selected",
              },

              "&.Mui-selected:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            {defaultLabel}
          </MenuItem>
        )}

        {items.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            {item.icon && (
              <Box
                component="span"
                sx={{ mr: 1, display: "flex", alignItems: "center" }}
              >
                {item.icon}
              </Box>
            )}
            {item.title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
