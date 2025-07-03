import { createFileRoute } from "@tanstack/react-router";
import { Sudoku } from "../components/Sudoku";

export const Route = createFileRoute("/$roomId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { roomId } = Route.useParams();
  return <Sudoku roomId={roomId} />;
}
