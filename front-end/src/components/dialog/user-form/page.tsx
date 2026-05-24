"use client";

import { FormDialog } from "@/components/common/form-dialog";
import { Box, Tab, Tabs } from "@mui/material";
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
  const [tabValue, setTabValue] = useState(0);

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
      setTabValue(0);
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

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const isSubmitDisabled =
    tabValue === 0 ? !manualState.isValid : !importState.isValid;
  const onSubmit = tabValue === 0 ? manualState.fn : importState.fn;
  const submitText = tabValue === 0 ? "Tạo người dùng" : `Lưu tất cả`;

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Thêm người dùng mới"
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
          <Tabs
            value={open ? tabValue : false}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              value={0}
              label="Nhập thủ công"
              icon={<User size={18} />}
              iconPosition="start"
              sx={{ textTransform: "none", fontWeight: 700, minHeight: 48 }}
            />
            <Tab
              value={1}
              label="Tải lên Excel"
              icon={<FileSpreadsheet size={18} />}
              iconPosition="start"
              sx={{ textTransform: "none", fontWeight: 700, minHeight: 48 }}
            />
          </Tabs>
        </Box>

        <Box sx={{ minHeight: 320, py: 1 }}>
          <Box sx={{ display: tabValue === 0 ? "block" : "none" }}>
            <ManualTab
              onReady={handleManualReady}
              onSaved={onSaved}
              onClose={onClose}
            />
          </Box>
          <Box sx={{ display: tabValue === 1 ? "block" : "none" }}>
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
