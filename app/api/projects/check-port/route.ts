import { NextRequest, NextResponse } from "next/server";
import net from "net";

function checkPortAvailability(port: number): Promise<{ available: boolean; error?: string }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(600);

    socket.once("connect", () => {
      socket.destroy();
      resolve({ available: false, error: `Port ${port} is currently in use by another running service.` });
    });

    socket.once("timeout", () => {
      socket.destroy();
      resolve({ available: true });
    });

    socket.once("error", (err: any) => {
      socket.destroy();
      resolve({ available: true });
    });

    socket.connect(port, "127.0.0.1");
  });
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const portParam = searchParams.get("port");
    const port = parseInt(portParam || "3000", 10);

    if (isNaN(port) || port < 1024 || port > 65535) {
      return NextResponse.json(
        { success: false, error: "Port must be a valid number between 1024 and 65535." },
        { status: 400 }
      );
    }

    const result = await checkPortAvailability(port);

    return NextResponse.json({
      success: true,
      port,
      available: result.available,
      message: result.available
        ? `Port ${port} is available for local development.`
        : result.error,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to inspect port status." },
      { status: 500 }
    );
  }
}
