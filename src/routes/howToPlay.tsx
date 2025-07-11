import { createFileRoute } from "@tanstack/react-router";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import {
  Edit,
  CheckCircle,
  Lightbulb,
  Refresh,
  TouchApp,
  GridOn,
  Numbers,
} from "@mui/icons-material";
import { useNavigate } from "@tanstack/react-router";

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Stack sx={{ pb: 3, pt: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "Luckiest Guy",
              letterSpacing: 8,
              color: "primary.main",
            }}
          >
            How to play
          </Typography>
        </Box>

        {/* Game Overview */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            🎯 Game Objective
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Fill the 9x9 grid with numbers 1-9 so that each row, column, and 3x3
            box contains each number exactly once. The puzzle starts with some
            numbers already filled in.
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Chip
              icon={<GridOn />}
              label="9x9 Grid"
              color="primary"
              sx={{ px: 1 }}
            />
            <Chip
              icon={<Numbers />}
              label="Numbers 1-9"
              color="secondary"
              sx={{ px: 1 }}
            />
            <Chip
              icon={<CheckCircle />}
              label="Unique in Row/Column/Box"
              color="success"
              sx={{ px: 1 }}
            />
          </Box>
        </Paper>

        {/* Game Modes */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            🎮 Game Modes
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                Single Player Mode
              </Typography>
              <Typography variant="body1">
                Play solo with three difficulty levels: Easy, Medium, and Hard.
                Each level offers a different number of pre-filled numbers and
                complexity.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" color="secondary" sx={{ mb: 1 }}>
                Multiplayer Mode
              </Typography>
              <Typography variant="body1">
                Create or join rooms to play with friends in real-time.
                Collaborate or compete to solve the same puzzle together.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Controls and Features */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            🎛️ Controls & Features
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <TouchApp color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Cell Selection"
                secondary="Tap any empty cell to select it. Selected cells are highlighted."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Numbers color="secondary" />
              </ListItemIcon>
              <ListItemText
                primary="Number Input"
                secondary="Use the number pad (1-9) at the bottom to fill selected cells. Tap a number to input it."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <TouchApp color="info" />
              </ListItemIcon>
              <ListItemText
                primary="Long Press to Lock Number"
                secondary="Long press (1 second) on any number in the number pad to lock it. The locked number will be highlighted and can be used repeatedly without reselecting."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Edit color="info" />
              </ListItemIcon>
              <ListItemText
                primary="Note Mode"
                secondary="Toggle 'Note On' to write small numbers as hints. Useful for planning moves."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Lightbulb color="warning" />
              </ListItemIcon>
              <ListItemText
                primary="Help Feature"
                secondary="Use the Help button (limited to 5 uses) to reveal the correct number for a selected cell."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Validation"
                secondary="Click 'Check' to verify if your solution is correct. Green means success, red means try again."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Refresh color="action" />
              </ListItemIcon>
              <ListItemText
                primary="New Game"
                secondary="Start a fresh puzzle with the 'New Game' button. Progress is automatically saved."
              />
            </ListItem>
          </List>
        </Paper>

        {/* Advanced Tips */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            💡 Pro Tips
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                Start with Easy Numbers
              </Typography>
              <Typography variant="body1">
                Look for rows, columns, or boxes that already have many numbers
                filled in. These are easier to complete first.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" color="secondary" sx={{ mb: 1 }}>
                Use the Note Feature
              </Typography>
              <Typography variant="body1">
                When you're unsure about a number, use note mode to write down
                possibilities. This helps you see patterns and eliminate
                options.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" color="success" sx={{ mb: 1 }}>
                Check for Singles
              </Typography>
              <Typography variant="body1">
                Look for cells that can only contain one possible number based
                on the numbers already in their row, column, and box.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" color="warning" sx={{ mb: 1 }}>
                Number Counter
              </Typography>
              <Typography variant="body1">
                The small numbers below each number pad show how many times that
                number appears on the board. Green means all 9 are placed, red
                means too many.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" color="info" sx={{ mb: 1 }}>
                Use Long Press for Efficiency
              </Typography>
              <Typography variant="body1">
                Long press (1 second) on any number to lock it. This is
                especially useful when you need to place the same number
                multiple times - you won't need to tap the number repeatedly.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Difficulty Levels */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            📊 Difficulty Levels
          </Typography>

          <Stack spacing={2}>
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: "#55E485",
                color: "white",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Easy
              </Typography>
              <Typography variant="body1">
                More pre-filled numbers, perfect for beginners. Great for
                learning the basic rules and strategies.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: "#DE9542",
                color: "white",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Medium
              </Typography>
              <Typography variant="body1">
                Balanced difficulty. Requires more logical thinking and pattern
                recognition.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: "secondary.main",
                color: "white",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Hard
              </Typography>
              <Typography variant="body1">
                Fewer pre-filled numbers, challenging even for experienced
                players. Requires advanced techniques and patience.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate({ to: "/" })}
            sx={{ color: "white" }}
          >
            Back to Menu
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate({ to: "/singlePlay" })}
          >
            Start Playing
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}

export const Route = createFileRoute("/howToPlay")({
  component: RouteComponent,
});
