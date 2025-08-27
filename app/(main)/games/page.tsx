import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GradientText } from "@/components/ui/gradient-text";
import GradientBorder from "@/components/ui/gradientBorder";

export default function GamesPage() {
  return (
    <div className="flex flex-1 flex-col bg-neutral-50 dark:bg-neutral-800 min-h-[calc(100dvh-64px)] p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Games
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Choose a game to play and have fun!
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 hover:border-purple-400/50 dark:hover:border-purple-900/50 hover:shadow-xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10 transition-all duration-300 transform hover:scale-105 gap-0 py-4">
          <CardHeader className="pb-2 relative z-10 px-4 pt-0">
            <div className="space-y-4">
              <GradientBorder className="w-full">
                <div className="dark:bg-neutral-800/90">
                  <div className="flex items-center justify-center p-6 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-lg backdrop-blur-sm">
                    <div className="grid grid-cols-3 gap-1 w-18 h-18">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        X
                      </div>
                      <div className="bg-white/80 dark:bg-neutral-700/80 rounded-sm"></div>
                      <div className="bg-gradient-to-br from-pink-500 to-orange-500 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        O
                      </div>
                      <div className="bg-white/80 dark:bg-neutral-700/80 rounded-sm"></div>
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        X
                      </div>
                      <div className="bg-white/80 dark:bg-neutral-700/80 rounded-sm"></div>
                      <div className="bg-gradient-to-br from-pink-500 to-orange-500 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        O
                      </div>
                      <div className="bg-white/80 dark:bg-neutral-700/80 rounded-sm"></div>
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        X
                      </div>
                    </div>
                  </div>
                </div>
              </GradientBorder>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <CardTitle className="text-xl font-bold">
              <GradientText variant="primary" className="text-2xl">
                Tic-Tac-Toe vs AI
              </GradientText>
            </CardTitle>
            <CardDescription className="mt-2 text-neutral-600 dark:text-neutral-400 mb-4">
              <div>Classic strategy game</div>
              <div>Get three in a row to win!</div>
            </CardDescription>
            <div>
              <Link href="/games/tic-tac-toe" className="group">
                <Button variant="outline" className="w-full">
                  Play now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 hover:border-green-400/50 dark:hover:border-green-900/50 hover:shadow-xl hover:shadow-green-500/20 dark:hover:shadow-green-500/10 transition-all duration-300 transform hover:scale-105 gap-0 py-4">
          <CardHeader className="pb-2 relative z-10 px-4 pt-0">
            <div className="space-y-4">
              <GradientBorder className="w-full">
                <div className="dark:bg-neutral-800/90">
                  <div className="flex items-center justify-center p-6 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-lg backdrop-blur-sm">
                    <div className="grid grid-cols-4 gap-1 w-18 h-18">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🎮
                      </div>
                      <div className="bg-neutral-300 dark:bg-neutral-600 rounded-sm"></div>
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🎯
                      </div>
                      <div className="bg-neutral-300 dark:bg-neutral-600 rounded-sm"></div>
                      <div className="bg-neutral-300 dark:bg-neutral-600 rounded-sm"></div>
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🎨
                      </div>
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🎮
                      </div>
                      <div className="bg-neutral-300 dark:bg-neutral-600 rounded-sm"></div>
                      <div className="bg-neutral-300 dark:bg-neutral-600 rounded-sm"></div>
                      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        ⚽
                      </div>
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🎯
                      </div>
                      <div className="bg-neutral-300 dark:bg-neutral-600 rounded-sm"></div>
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🎨
                      </div>
                      <div className="bg-neutral-300 dark:bg-neutral-600 rounded-sm"></div>
                      <div className="bg-neutral-300 dark:bg-neutral-600 rounded-sm"></div>
                      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        ⚽
                      </div>
                    </div>
                  </div>
                </div>
              </GradientBorder>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <CardTitle className="text-xl font-bold">
              <GradientText variant="primary" className="text-2xl">
                Memory Game
              </GradientText>
            </CardTitle>
            <CardDescription className="mt-2 text-neutral-600 dark:text-neutral-400 mb-4">
              <div>Match pairs of cards</div>
              <div>Test your memory skills!</div>
            </CardDescription>
            <div>
              <Link href="/games/memory" className="group">
                <Button variant="outline" className="w-full">
                  Play now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 hover:border-yellow-400/50 dark:hover:border-yellow-900/50 hover:shadow-xl hover:shadow-yellow-500/20 dark:hover:shadow-yellow-500/10 transition-all duration-300 transform hover:scale-105 gap-0 py-4">
          <CardHeader className="pb-2 relative z-10 px-4 pt-0">
            <div className="space-y-4">
              <GradientBorder className="w-full">
                <div className="dark:bg-neutral-800/90">
                  <div className="flex items-center justify-center p-6 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-lg backdrop-blur-sm">
                    <div className="grid grid-cols-4 gap-1 w-18 h-18">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        💰
                      </div>
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        💵
                      </div>
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        💳
                      </div>
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🛒
                      </div>
                      <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🏠
                      </div>
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🚗
                      </div>
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        ✈️
                      </div>
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🏝️
                      </div>
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        💎
                      </div>
                      <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🛥️
                      </div>
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🏰
                      </div>
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🚀
                      </div>
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🌟
                      </div>
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        💸
                      </div>
                      <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        ⏰
                      </div>
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-sm flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🎯
                      </div>
                    </div>
                  </div>
                </div>
              </GradientBorder>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <CardTitle className="text-xl font-bold">
              <GradientText variant="primary" className="text-2xl">
                Spend It!
              </GradientText>
            </CardTitle>
            <CardDescription className="mt-2 text-neutral-600 dark:text-neutral-400 mb-4">
              <div>Spend $1 trillion in 3 minutes</div>
              <div>Can you buy everything in time?</div>
            </CardDescription>
            <div>
              <Link href="/games/spend-it" className="group">
                <Button variant="outline" className="w-full">
                  Play now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 hover:border-orange-400/50 dark:hover:border-orange-900/50 hover:shadow-xl hover:shadow-orange-500/20 dark:hover:shadow-orange-500/10 transition-all duration-300 transform hover:scale-105 gap-0 py-4">
          <CardHeader className="pb-2 relative z-10 px-4 pt-0">
            <div className="space-y-4">
              <GradientBorder className="w-full">
                <div className="dark:bg-neutral-800/90">
                  <div className="flex items-center justify-center p-6 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-lg backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-2 w-18 h-18">
                      <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-sm transform rotate-12">
                        ?
                      </div>
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-sm">
                        🧩
                      </div>
                      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-sm">
                        🔍
                      </div>
                      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-sm">
                        💡
                      </div>
                    </div>
                  </div>
                </div>
              </GradientBorder>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <CardTitle className="text-xl font-bold">
              <GradientText variant="primary" className="text-2xl">
                Puzzle Games
              </GradientText>
            </CardTitle>
            <CardDescription className="mt-2 text-neutral-600 dark:text-neutral-400 mb-4">
              <div>Multi-step mystery puzzle</div>
              <div>Think creatively to solve each step!</div>
            </CardDescription>
            <div>
              <Link href="/games/puzzle" className="group">
                <Button variant="outline" className="w-full">
                  Play now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
