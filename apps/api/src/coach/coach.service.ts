import { Injectable } from '@nestjs/common';

@Injectable()
export class CoachService {
  async generateResponse(
    message: string,
    history: any[],
    routines: any[],
    weights: any[],
  ): Promise<{ reply: string; suggestedRoutine?: any }> {
    const prompt = message.toLowerCase();

    // 1. Progress / Analytics query
    if (prompt.includes('analyze') || prompt.includes('progress') || prompt.includes('analytic')) {
      return this.analyzeProgress(history, weights);
    }

    // 2. Routine Suggestion queries
    if (prompt.includes('routine') || prompt.includes('suggest') || prompt.includes('plan') || prompt.includes('program')) {
      if (prompt.includes('leg') || prompt.includes('squat')) {
        return {
          reply: `I have compiled a specialized Leg workout routine for you! It targets your quadriceps, hamstrings, and glutes to build overall lower body power.\n\nType: Leg Focus\nVolume: High\n\nYou can import this routine directly to your dashboard templates by tapping the save button below!`,
          suggestedRoutine: {
            title: 'AI Quad & Glute Builder',
            exercises: [
              {
                id: '3', // Barbell Squat
                name: 'Barbell Squat',
                category: 'Barbell',
                primaryMuscle: 'Legs',
                sets: [
                  { id: 'l1', weight: 60, reps: 10, isCompleted: false },
                  { id: 'l2', weight: 70, reps: 8, isCompleted: false },
                  { id: 'l3', weight: 80, reps: 6, isCompleted: false },
                ],
              },
              {
                id: 'leg-ext',
                name: 'Leg Extension',
                category: 'Machine',
                primaryMuscle: 'Legs',
                sets: [
                  { id: 'le1', weight: 35, reps: 12, isCompleted: false },
                  { id: 'le2', weight: 40, reps: 10, isCompleted: false },
                ],
              },
            ],
          },
        };
      }

      if (prompt.includes('chest') || prompt.includes('bench') || prompt.includes('push')) {
        return {
          reply: `Here is a custom Chest & Push workout suggestion! It covers compound horizontal presses and chest flies to target your upper/lower chest muscle fibers.\n\nType: Chest Focus\nVolume: Moderate-High\n\nClick the save button below to save it as a routine.`,
          suggestedRoutine: {
            title: 'AI Chest Power Session',
            exercises: [
              {
                id: '1', // Barbell Bench Press
                name: 'Barbell Bench Press',
                category: 'Barbell',
                primaryMuscle: 'Chest',
                sets: [
                  { id: 'c1', weight: 50, reps: 10, isCompleted: false },
                  { id: 'c2', weight: 60, reps: 8, isCompleted: false },
                  { id: 'c3', weight: 65, reps: 6, isCompleted: false },
                ],
              },
              {
                id: '2', // Dumbbell Incline Press
                name: 'Dumbbell Incline Press',
                category: 'Dumbbell',
                primaryMuscle: 'Chest',
                sets: [
                  { id: 'c4', weight: 18, reps: 10, isCompleted: false },
                  { id: 'c5', weight: 22, reps: 8, isCompleted: false },
                ],
              },
            ],
          },
        };
      }

      // Default suggested routine: Full Body
      return {
        reply: `I suggest starting with this Full Body Blast routine! It stimulates all major muscle groups (Chest, Back, and Legs) in a single session to optimize growth and recovery cycles.\n\nType: Full Body\nVolume: Balanced\n\nTap save below to add it directly to your routines.`,
        suggestedRoutine: {
          title: 'AI Balanced Full Body',
          exercises: [
            {
              id: '1', // Bench Press
              name: 'Barbell Bench Press',
              category: 'Barbell',
              primaryMuscle: 'Chest',
              sets: [{ id: 'f1', weight: 50, reps: 10, isCompleted: false }],
            },
            {
              id: '4', // Deadlift
              name: 'Barbell Deadlift',
              category: 'Barbell',
              primaryMuscle: 'Back',
              sets: [{ id: 'f2', weight: 70, reps: 5, isCompleted: false }],
            },
            {
              id: '3', // Squat
              name: 'Barbell Squat',
              category: 'Barbell',
              primaryMuscle: 'Legs',
              sets: [{ id: 'f3', weight: 60, reps: 8, isCompleted: false }],
            },
          ],
        },
      };
    }

    // 3. Exercise Form queries
    if (prompt.includes('form') || prompt.includes('how to') || prompt.includes('tip') || prompt.includes('explain')) {
      if (prompt.includes('squat')) {
        return {
          reply: `**Squat Form Guide:**\n\n1. **Setup**: Rest the barbell across your upper traps. Stand with feet slightly wider than shoulder-width apart, toes flared out about 15 degrees.\n2. **Bracing**: Take a deep breath, brace your core, and keep your chest proud.\n3. **Descent**: Initiate by hingeing at the hips and bending the knees. Lower yourself until your thighs are parallel to the ground or lower.\n4. **Ascent**: Keep your knees pushed outwards (do not let them cave in) and drive upward through your heels. Exhale at the top.\n\n*Coach Tip: Avoid rounding your lower back at the bottom of the movement.*`,
        };
      }
      if (prompt.includes('bench')) {
        return {
          reply: `**Bench Press Form Guide:**\n\n1. **Setup**: Lie flat on the bench, feet planted firmly on the floor. Grip the bar slightly wider than shoulder-width.\n2. **Unrack**: Unrack the bar and hold it directly above your chest with straight arms.\n3. **Descent**: Lower the bar slowly to your mid-chest (touching around the sternum), keeping your elbows tucked at a 45-degree angle to protect your shoulders.\n4. **Drive**: Push the barbell straight back up to full lockout by pressing your feet into the floor (leg drive).\n\n*Coach Tip: Keep your shoulder blades retracted (pinched together) throughout the set.*`,
        };
      }
      if (prompt.includes('deadlift')) {
        return {
          reply: `**Deadlift Form Guide:**\n\n1. **Setup**: Stand with feet hip-width apart, shins about 1 inch from the barbell. Grip the bar just outside your knees.\n2. **Position**: Hinge forward, drop your hips, flatten your lower back, and pull your chest up. Your shoulders should be slightly ahead of the bar.\n3. **Pull**: Drive through your legs to pull the barbell up. Keep the bar close to your shins/thighs.\n4. **Lockout**: Stand tall, squeezing your glutes at the top. Do not hyperextend (lean back too far) your lower spine.\n\n*Coach Tip: Imagine pushing the floor away rather than pulling the bar up.*`,
        };
      }
      return {
        reply: `I can explain form tips for major compound movements! Ask me about: \n- Barbell Squat\n- Barbell Bench Press\n- Barbell Deadlift`,
      };
    }

    // 4. Default fallback response
    return {
      reply: `Hi there! I am your Vault AI Coach. 🏋️‍♂️\n\nHere are some things you can ask me to help you hit your fitness goals:\n\n1. **"Analyze my progress"** - I will parse your workout metrics, logged volumes, and streaks to create a progress review.\n2. **"Suggest a leg routine"** or **"Suggest a chest routine"** - I'll compile a structured routine template which you can save to your library.\n3. **"Explain squats form"** - I will break down safety guidelines, execution steps, and tips.`,
    };
  }

  private analyzeProgress(history: any[], weights: any[]): { reply: string } {
    if (history.length === 0) {
      return {
        reply: `You haven't logged any workouts in GymVault yet! Start by adding your weight or tracking a routine from the dashboard, and I'll analyze your weekly training progression from here.`,
      };
    }

    const totalWorkouts = history.length;
    const totalVolume = history.reduce((acc: number, w: any) => {
      return (
        acc +
        w.exercises.reduce((exAcc: number, ex: any) => {
          return (
            exAcc +
            ex.sets.reduce((setAcc: number, set: any) => (set.isCompleted ? setAcc + set.weight * set.reps : setAcc), 0)
          );
        }, 0)
      );
    }, 0);

    // Compute muscle training distribution
    const muscleMap = new Map<string, number>();
    history.forEach((w: any) => {
      w.exercises.forEach((ex: any) => {
        const muscle = ex.primaryMuscle || 'Other';
        muscleMap.set(muscle, (muscleMap.get(muscle) || 0) + ex.sets.length);
      });
    });

    let topMuscle = 'N/A';
    let maxSets = 0;
    muscleMap.forEach((sets, muscle) => {
      if (sets > maxSets) {
        maxSets = sets;
        topMuscle = muscle;
      }
    });

    // Body Weight Stats
    let weightSummary = '';
    if (weights.length > 0) {
      const sorted = [...weights].sort((a, b) => b.date - a.date);
      const latest = sorted[0].weight;
      if (weights.length > 1) {
        const oldest = [...weights].sort((a, b) => a.date - b.date)[0].weight;
        const diff = latest - oldest;
        weightSummary = `\n- **Weight Trend**: Your latest weight is **${latest} kg** (overall change of **${diff >= 0 ? '+' : ''}${diff.toFixed(1)} kg**).`;
      } else {
        weightSummary = `\n- **Weight Trend**: Your registered body weight is **${latest} kg**.`;
      }
    }

    const musclesList = Array.from(muscleMap.entries())
      .map(([m, s]) => `* ${m}: ${s} sets`)
      .join('\n');

    return {
      reply: `### GymVault Progress Report 📈\n\n- **Total Sessions**: You have completed **${totalWorkouts}** workout sessions.\n- **Volume Shift**: You have lifted a total of **${totalVolume.toLocaleString()} kg** across all logged routines!\n- **Muscle Distribution**: Your most active muscle group is **${topMuscle}** (having logged **${maxSets}** completed sets).\n${weightSummary}\n\n**Training Distribution Breakdown**:\n${musclesList}\n\n*Coach Recommendation: Keep doing what you're doing! Make sure to space out your high-volume days and drink plenty of water.*`,
    };
  }
}
