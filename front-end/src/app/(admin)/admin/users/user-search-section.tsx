"use client";

import type { RoleEnum } from "@/lib/api/types";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { SearchInput } from "@/components/common/search-input";
import { FilterSelect } from "@/components/common/filter-select";
import { ROLE_OPTIONS } from "@/lib/roles";

interface UserSearchSectionProps {
  onSearch: (keyword: string, role: RoleEnum) => void;
  initialRole?: RoleEnum;
  loading?: boolean;
}

export function UserSearchSection({
  onSearch,
  initialRole = "STUDENT",
  loading = false,
}: UserSearchSectionProps) {
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState<RoleEnum>(initialRole);

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  const handleSearchTrigger = (searchVal: string) => {
    onSearch(searchVal.trim(), role);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        gap: 2,
        width: "100%",
      }}
    >
      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          onSearch={handleSearchTrigger}
          onClear={() => handleSearchTrigger("")}
          placeholder="Tìm kiếm theo họ tên, email, tên đăng nhập..."
        />
      </Box>

      <Box
        sx={{
          minWidth: { xs: "100%", sm: 220 },
          "& .MuiFormControl-root": { width: "100% !important" },
        }}
      >
        <FilterSelect
          label="Vai trò bắt buộc *"
          value={role}
          onChange={(val) => {
            const newRole = val as RoleEnum;
            setRole(newRole);
            onSearch(keyword.trim(), newRole);
          }}
          items={ROLE_OPTIONS}
          disabled={loading}
        />
      </Box>
    </Box>
  );
}
