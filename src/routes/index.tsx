import { createFileRoute } from "@tanstack/react-router";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { createRoom, deleteRoom, listRooms } from "../services/sudokuService";
import { useQuery } from "@tanstack/react-query";

const generateRoomId = () => Math.random().toString(36).substring(2, 8);

function RouteComponent() {
  const roomId = generateRoomId();
  const navigate = useNavigate();

  const { data: rooms, refetch } = useQuery({
    queryKey: ["rooms"],
    queryFn: listRooms,
  });

  return (
    <Container>
      <Stack mt={2}>
        <Stack direction="row">
          <Button
            variant="contained"
            onClick={() => navigate({ to: "/singlePlay" })}
            sx={{ color: "white" }}
            fullWidth
          >
            Single Player
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={async () => {
              await createRoom(roomId);
              await refetch();
            }}
            sx={{ color: "white" }}
            fullWidth
          >
            Create Room
          </Button>
        </Stack>

        {rooms && (
          <Stack>
            {Object.keys(rooms).map((roomId) => (
              <Box
                sx={{
                  border: "1px dashed",
                  p: 1,
                  borderRadius: 1,
                  borderColor: "grey.300",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Typography component={"span"} variant="body1">
                  ID: {roomId}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      navigate({
                        to: "/$roomId",
                        params: {
                          roomId: roomId,
                        },
                      });
                    }}
                  >
                    Join
                  </Button>{" "}
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={async () => {
                      await deleteRoom(roomId);
                      refetch();
                    }}
                  >
                    Del
                  </Button>
                </Stack>
                {/* <Stack direction="row" spacing={1}>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      border: 1,
                      borderRadius: 1,
                      borderColor: "divider",
                      width: "fit-content",
                    }}
                  >
                    Board A
                  </Box>
                </Stack> */}
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}

export const Route = createFileRoute("/")({
  component: RouteComponent,
});
