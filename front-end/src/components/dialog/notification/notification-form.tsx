"use client";

import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { RichTextEditor } from "@/components/common/form/rich-text-editor";
import type { RoleEnum } from "@/lib/type/enum";
import type { CreateGroupNotificationRequest } from "@/lib/type/notification";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Typography,
} from "@mui/material";
import { BellRing, Send, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const AVAILABLE_ROLES: {
  role: RoleEnum;
  label: string;
  description: string;
}[] = [
  {
    role: "STUDENT",
    label: "Students",
    description: "All registered students",
  },
  {
    role: "LECTURER",
    label: "Lecturers",
    description: "All instructors on the platform",
  },
  {
    role: "ADMIN",
    label: "Admins",
    description: "All administrative users",
  },
];

export interface CreateGroupNotificationDialogProps {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (request: CreateGroupNotificationRequest) => Promise<void>;
}

export function CreateGroupNotificationDialog({
  open,
  saving,
  onClose,
  onSave,
}: CreateGroupNotificationDialogProps) {
  const [form, setForm] = useState<CreateGroupNotificationRequest>({
    title: "",
    content: "",
    targetRoles: ["STUDENT", "LECTURER", "ADMIN"],
  });

  const [touched, setTouched] = useState({
    title: false,
    content: false,
    targetRoles: false,
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: "",
        content: "",
        targetRoles: ["STUDENT", "LECTURER", "ADMIN"],
      });
      setTouched({ title: false, content: false, targetRoles: false });
    }
  }, [open]);

  const errors = useMemo(() => {
    const titleTrimmed = form.title.trim();
    return {
      title: titleTrimmed.length < 3 || titleTrimmed.length > 120,
      targetRoles: form.targetRoles.length === 0,
    };
  }, [form]);

  const isValid = !errors.title && !errors.targetRoles;

  const handleRoleToggle = (role: RoleEnum) => {
    setTouched((prev) => ({ ...prev, targetRoles: true }));
    setForm((prev) => {
      const exists = prev.targetRoles.includes(role);
      const updatedRoles = exists
        ? prev.targetRoles.filter((r) => r !== role)
        : [...prev.targetRoles, role];
      return { ...prev, targetRoles: updatedRoles };
    });
  };

  const handleSubmit = async () => {
    setTouched({ title: true, content: true, targetRoles: true });
    if (!isValid) return;
    await onSave(form);
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      headerIcon={<BellRing size={20} />}
      title="Create Group Notification"
      submitText="Send Announcement"
      submitIcon={<Send size={16} />}
      isSubmitDisabled={saving || !isValid}
      maxWidth="md"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Title */}
        <FormInput
          label="Notification Title"
          placeholder="e.g. Scheduled System Maintenance Notice"
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
          error={touched.title && errors.title}
          helperText="Title must be between 3 and 120 characters."
          disabled={saving}
          required
          icon={<BellRing size={18} />}
          iconPosition="start"
          characterCount={form.title.length}
          maxLength={120}
        />

        {/* Content Rich Text Editor (Without Images) */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, fontWeight: 700, color: "text.primary" }}
          >
            Notification Content
          </Typography>
          <RichTextEditor
            value={form.content || ""}
            onChange={(val) => setForm((prev) => ({ ...prev, content: val }))}
            disableImage={true}
            minHeight={180}
          />
        </Box>

        {/* Target Roles Selection */}
        <FormControl
          component="fieldset"
          error={touched.targetRoles && errors.targetRoles}
          variant="standard"
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            bgcolor: "#f8fafc",
            border: "1px solid rgba(15, 23, 42, 0.08)",
          }}
        >
          <FormLabel
            component="legend"
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "text.primary",
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Users size={18} />
            Target User Groups *
          </FormLabel>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mb: 1.5, display: "block" }}
          >
            Select one or more user roles that will receive this notification.
          </Typography>

          <FormGroup row>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                width: "100%",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              {AVAILABLE_ROLES.map(({ role, label, description }) => {
                const checked = form.targetRoles.includes(role);
                return (
                  <Box
                    key={role}
                    onClick={() => !saving && handleRoleToggle(role)}
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: checked
                        ? "primary.main"
                        : "rgba(15, 23, 42, 0.12)",
                      bgcolor: checked ? "rgba(37, 99, 235, 0.04)" : "#ffffff",
                      cursor: saving ? "default" : "pointer",
                      transition: "all 0.15s ease-in-out",
                      "&:hover": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <FormControlLabel
                      onClick={(e) => e.stopPropagation()}
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={() => handleRoleToggle(role)}
                          disabled={saving}
                          size="small"
                        />
                      }
                      label={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "text.primary" }}
                          >
                            {label}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              fontSize: "0.75rem",
                            }}
                          >
                            {description}
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0, width: "100%", alignItems: "flex-start" }}
                    />
                  </Box>
                );
              })}
            </Box>
          </FormGroup>

          {touched.targetRoles && errors.targetRoles && (
            <FormHelperText color="error" sx={{ mt: 1, fontWeight: 600 }}>
              Please select at least one target role group.
            </FormHelperText>
          )}
        </FormControl>
      </Box>
    </FormDialog>
  );
}
