"use client";

import { AnimatedTabs } from "@/components/common/animated-tabs";
import { FormDialog } from "@/components/common/form-dialog";
import { Box } from "@mui/material";
import { FileSpreadsheet, User, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ImportTab } from "./import-tab";
import { ManualTab } from "./manual-tab";

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function UserFormDialog({
  open,
  onClose,
  onSaved,
}: UserFormDialogProps) {
  const [tabValue, setTabValue] = useState<"manual" | "import">("manual");

  const [manualState, setManualState] = useState({
    isValid: false,
    fn: async () => {},
  });
  const [importState, setImportState] = useState({
    isValid: false,
    fn: async () => {},
    count: 0,
  });

  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (open) {
      setTabValue("manual");
      setResetKey((prev) => prev + 1);
    }
  }, [open]);

  const handleManualReady = useCallback(
    (isValid: boolean, fn: () => Promise<void>) => {
      setManualState({ isValid, fn });
    },
    [],
  );

  const handleImportReady = useCallback(
    (isValid: boolean, fn: () => Promise<void>, count: number) => {
      setImportState({ isValid, fn, count });
    },
    [],
  );

  const isSubmitDisabled =
    tabValue === "manual" ? !manualState.isValid : !importState.isValid;
  const onSubmit = tabValue === "manual" ? manualState.fn : importState.fn;
  const submitText = tabValue === "manual" ? "Create users" : `Save all`;

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Add new users"
      headerIcon={<UserPlus size={24} />}
      submitText={submitText}
      isSubmitDisabled={isSubmitDisabled}
      maxWidth="md"
    >
      <Box
        key={resetKey}
        sx={{ width: "100%", display: "flex", flexDirection: "column" }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1, mt: -1 }}>
          <AnimatedTabs
            tabs={[
              {
                value: "manual",
                label: "Manual entry",
                icon: <User size={18} />,
                iconPosition: "start",
              },
              {
                value: "import",
                label: "Upload Excel file",
                icon: <FileSpreadsheet size={18} />,
                iconPosition: "start",
              },
            ]}
            value={tabValue}
            onChange={setTabValue}
            colorTheme="primary"
          />
        </Box>

        <Box sx={{ minHeight: 320, py: 1 }}>
          <Box sx={{ display: tabValue === "manual" ? "block" : "none" }}>
            <ManualTab
              onReady={handleManualReady}
              onSaved={onSaved}
              onClose={onClose}
            />
          </Box>
          <Box sx={{ display: tabValue === "import" ? "block" : "none" }}>
            <ImportTab
              onReady={handleImportReady}
              onSaved={onSaved}
              onClose={onClose}
            />
          </Box>
        </Box>
      </Box>
    </FormDialog>
  );
}
