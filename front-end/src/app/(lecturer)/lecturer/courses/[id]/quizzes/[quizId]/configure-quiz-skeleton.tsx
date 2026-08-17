"use client";

import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
} from "@mui/material";

export function ConfigureQuizSkeleton() {
  return (
    <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
      {/* Main Left Column */}
      <Grid size={{ xs: 12, lg: 8.5 }}>
        <Stack spacing={3}>
          {/* 1. Quiz Info Skeleton Card */}
          <Card variant="outlined" sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2.5,
                }}
              >
                <Skeleton variant="text" width={180} height={28} />
                <Skeleton
                  variant="rounded"
                  width={80}
                  height={24}
                  sx={{ borderRadius: 1 }}
                />
              </Box>

              <Stack spacing={2.5}>
                <Box>
                  <Skeleton
                    variant="text"
                    width={100}
                    height={18}
                    sx={{ mb: 0.5 }}
                  />
                  <Skeleton
                    variant="rounded"
                    height={48}
                    sx={{ borderRadius: 1.5 }}
                  />
                </Box>

                <Box>
                  <Skeleton
                    variant="text"
                    width={90}
                    height={18}
                    sx={{ mb: 0.5 }}
                  />
                  <Skeleton
                    variant="rounded"
                    height={80}
                    sx={{ borderRadius: 1.5 }}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Skeleton
                    variant="rounded"
                    width={150}
                    height={40}
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* 2. Type Configs Skeleton Card */}
          <Card variant="outlined" sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2.5,
                }}
              >
                <Box>
                  <Skeleton variant="text" width={220} height={26} />
                  <Skeleton variant="text" width={280} height={18} />
                </Box>
                <Skeleton
                  variant="rounded"
                  width={140}
                  height={36}
                  sx={{ borderRadius: 2 }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Skeleton variant="text" width={120} height={20} />
                        <Skeleton variant="text" width={140} height={16} />
                        <Skeleton
                          variant="rounded"
                          width={90}
                          height={20}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Skeleton
                        variant="rounded"
                        width={64}
                        height={30}
                        sx={{ borderRadius: 2 }}
                      />
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Skeleton variant="text" width={120} height={20} />
                        <Skeleton variant="text" width={140} height={16} />
                        <Skeleton
                          variant="rounded"
                          width={90}
                          height={20}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Skeleton
                        variant="rounded"
                        width={64}
                        height={30}
                        sx={{ borderRadius: 2 }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* 3. Questions Section Skeleton Card */}
          <Card variant="outlined" sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Skeleton
                variant="text"
                width={240}
                height={28}
                sx={{ mb: 2.5 }}
              />

              <Stack spacing={3}>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Skeleton variant="text" width={200} height={22} />
                    <Skeleton
                      variant="rounded"
                      width={110}
                      height={32}
                      sx={{ borderRadius: 2 }}
                    />
                  </Box>

                  <Stack spacing={1.5}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1.5,
                        }}
                      >
                        <Skeleton variant="text" width={130} height={20} />
                        <Stack direction="row" spacing={1}>
                          <Skeleton
                            variant="rounded"
                            width={76}
                            height={28}
                            sx={{ borderRadius: 1.5 }}
                          />
                          <Skeleton
                            variant="rounded"
                            width={56}
                            height={28}
                            sx={{ borderRadius: 1.5 }}
                          />
                          <Skeleton
                            variant="rounded"
                            width={64}
                            height={28}
                            sx={{ borderRadius: 1.5 }}
                          />
                        </Stack>
                      </Box>
                      <Skeleton variant="text" width="90%" height={20} />
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Skeleton
                            variant="rounded"
                            height={34}
                            sx={{ borderRadius: 1.5 }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Skeleton
                            variant="rounded"
                            height={34}
                            sx={{ borderRadius: 1.5 }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1.5,
                        }}
                      >
                        <Skeleton variant="text" width={130} height={20} />
                        <Stack direction="row" spacing={1}>
                          <Skeleton
                            variant="rounded"
                            width={76}
                            height={28}
                            sx={{ borderRadius: 1.5 }}
                          />
                          <Skeleton
                            variant="rounded"
                            width={56}
                            height={28}
                            sx={{ borderRadius: 1.5 }}
                          />
                          <Skeleton
                            variant="rounded"
                            width={64}
                            height={28}
                            sx={{ borderRadius: 1.5 }}
                          />
                        </Stack>
                      </Box>
                      <Skeleton variant="text" width="85%" height={20} />
                    </Paper>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>

      {/* Right Column Progress Summary Skeleton Card */}
      <Grid
        size={{ xs: 12, lg: 3.5 }}
        sx={{
          position: { xs: "static", lg: "sticky" },
          top: { xs: "auto", lg: 96 },
          alignSelf: "flex-start",
          zIndex: 10,
        }}
      >
        <Card
          variant="outlined"
          sx={{
            borderRadius: 1,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            bgcolor: "background.paper",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Skeleton variant="text" width={160} height={26} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={220} height={16} sx={{ mb: 2 }} />

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Skeleton variant="text" width={90} height={18} />
                  <Skeleton
                    variant="rounded"
                    width={44}
                    height={20}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
                <Skeleton
                  variant="rounded"
                  height={6}
                  sx={{ borderRadius: 3 }}
                />
              </Box>

              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Skeleton variant="text" width={100} height={18} />
                  <Skeleton
                    variant="rounded"
                    width={44}
                    height={20}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
                <Skeleton
                  variant="rounded"
                  height={6}
                  sx={{ borderRadius: 3 }}
                />
              </Box>

              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Skeleton variant="text" width={70} height={18} />
                  <Skeleton
                    variant="rounded"
                    width={44}
                    height={20}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
                <Skeleton
                  variant="rounded"
                  height={6}
                  sx={{ borderRadius: 3 }}
                />
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Skeleton
              variant="rounded"
              height={44}
              sx={{ borderRadius: 2.5 }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
