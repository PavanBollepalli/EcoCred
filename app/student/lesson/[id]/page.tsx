"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, TreePine, Recycle, Zap, Droplets, CheckCircle } from "lucide-react"
import { getCurrentUserFromSession, completeLesson, getUserLessonProgress } from "@/lib/storage-api"
import type { User } from "@/lib/storage-api"

const lessons = {
  "tree-planting": {
    id: "tree-planting",
    title: "Tree Planting Basics",
    category: "planting",
    icon: TreePine,
    coverImage: "/students-planting-trees-in-school-garden-with-shov.jpg",
    duration: "8 min read",
    points: 15,
    content: {
      introduction:
        "Trees are Earth's lungs, absorbing carbon dioxide and producing oxygen. Learning proper planting techniques ensures your saplings grow into healthy, impactful trees that benefit the environment for decades.",
      sections: [
        {
          title: "Environmental Impact of Trees",
          content: [
            "A single mature tree absorbs 48 pounds of CO₂ annually - equivalent to driving 26 miles in a car",
            "One tree produces enough oxygen for two people per day",
            "Trees reduce surrounding air temperature by 2-8°F through evapotranspiration",
            "Root systems prevent soil erosion and reduce flood risk by absorbing rainwater",
            "Urban trees increase property values by 7-15% and reduce energy costs by up to 30%",
          ],
        },
        {
          title: "Choosing the Right Tree Species",
          content: [
            "Native species adapt better to local climate and require less maintenance",
            "Fast-growing species: Neem, Gulmohar, Peepal (good for quick impact)",
            "Fruit trees: Mango, Guava, Pomegranate (provide food and shade)",
            "Flowering trees: Jacaranda, Flame of Forest (attract pollinators)",
            "Consider mature size - large trees need 20+ feet spacing from buildings",
          ],
        },
        {
          title: "Best Planting Seasons in India",
          content: [
            "Pre-monsoon (May-June): Plant just before rains for natural watering",
            "Monsoon (July-September): Ideal time with consistent rainfall",
            "Post-monsoon (October-November): Good for areas with extended growing season",
            "Avoid summer (March-May) and winter (December-February) planting",
            "Check local climate patterns - coastal vs inland timing may vary",
          ],
        },
        {
          title: "Step-by-Step Planting Guide",
          content: [
            "Site Selection: Choose location with 6+ hours sunlight, good drainage, away from power lines",
            "Hole Preparation: Dig hole 2x wider than root ball, same depth as container",
            "Soil Preparation: Mix native soil with compost (1:1 ratio) for better nutrition",
            "Planting: Remove container, loosen root ball, place tree, backfill gently",
            "Watering: Deep watering immediately after planting, then daily for first month",
            "Mulching: Apply 2-3 inch layer around base (not touching trunk) to retain moisture",
            "Staking: Use for trees over 6 feet tall, remove after 1 year",
          ],
        },
        {
          title: "Long-term Care and Maintenance",
          content: [
            "First Year: Water deeply 2-3 times per week, monitor for pests/diseases",
            "Pruning: Remove dead/damaged branches, shape tree in dormant season",
            "Fertilization: Apply organic compost annually, avoid chemical fertilizers",
            "Protection: Guard against grazing animals, mechanical damage",
            "Monitoring: Check for signs of stress, disease, or nutrient deficiency",
          ],
        },
      ],
      tips: [
        "Plant multiple species to create biodiversity and reduce disease risk",
        "Join local tree planting drives to learn from experienced gardeners",
        "Keep planting records - track species, date, location for future reference",
        "Consider companion planting with shrubs and flowers for ecosystem benefits",
      ],
      quiz: [
        {
          question: "How much CO₂ does one mature tree absorb per year?",
          options: ["24 pounds", "48 pounds", "72 pounds", "96 pounds"],
          correct: 1,
        },
        {
          question: "What is the ideal hole width for planting?",
          options: ["Same as root ball", "1.5x root ball width", "2x root ball width", "3x root ball width"],
          correct: 2,
        },
        {
          question: "Which season is best for planting in India?",
          options: ["Summer", "Winter", "Pre-monsoon", "Post-winter"],
          correct: 2,
        },
      ],
    },
  },
  "waste-management": {
    id: "waste-management",
    title: "Waste Management & Recycling",
    category: "waste",
    icon: Recycle,
    coverImage: "/colorful-recycling-bins-with-waste-segregation-sym.jpg",
    duration: "10 min read",
    points: 20,
    content: {
      introduction:
        "Effective waste management is crucial for environmental health. The average person generates 4.5 pounds of waste daily. Learning the 5 R's and proper segregation can reduce your environmental footprint by up to 75%.",
      sections: [
        {
          title: "The 5 R's Hierarchy (In Order of Priority)",
          content: [
            "REFUSE: Say no to unnecessary items - single-use plastics, excessive packaging, promotional items",
            "REDUCE: Minimize consumption - buy only what you need, choose quality over quantity",
            "REUSE: Find new purposes - glass jars for storage, old clothes as cleaning rags",
            "RECYCLE: Process into new materials - paper, plastic, metal, glass through proper channels",
            "ROT: Compost organic waste - food scraps, yard waste into nutrient-rich soil amendment",
          ],
        },
        {
          title: "Comprehensive Waste Segregation Guide",
          content: [
            "WET WASTE (Green Bin): Food scraps, vegetable peels, fruit rinds, tea bags, coffee grounds, garden waste, flowers",
            "DRY RECYCLABLE (Blue Bin): Clean paper, cardboard, plastic bottles, metal cans, glass containers, cloth",
            "HAZARDOUS WASTE (Red Bin): Batteries, medicines, chemicals, paint, electronic waste, fluorescent bulbs",
            "SANITARY WASTE: Diapers, sanitary napkins, tissues - wrap and dispose separately",
            "E-WASTE: Computers, phones, appliances - take to certified e-waste recyclers",
          ],
        },
        {
          title: "Home Composting Made Simple",
          content: [
            "Container Setup: Use plastic bin with holes, wooden box, or designated corner",
            "Brown Materials (Carbon): Dry leaves, paper, cardboard, sawdust - 60% of mix",
            "Green Materials (Nitrogen): Food scraps, fresh grass clippings - 40% of mix",
            "Layering: Alternate brown and green materials, keep moist but not soggy",
            "Turning: Mix every 2 weeks to aerate, speeds decomposition process",
            "Timeline: Ready compost in 2-3 months, dark and earthy smelling",
          ],
        },
        {
          title: "Plastic Reduction Strategies",
          content: [
            "Shopping: Carry reusable bags, choose loose produce over packaged",
            "Food Storage: Use glass containers, beeswax wraps instead of plastic wrap",
            "Beverages: Carry reusable water bottle, avoid single-use cups",
            "Personal Care: Choose bar soaps, bamboo toothbrushes, refillable containers",
            "Alternatives: Paper straws, cloth napkins, metal utensils for takeout",
          ],
        },
        {
          title: "Community Waste Solutions",
          content: [
            "Organize neighborhood clean-up drives and segregation awareness programs",
            "Set up community composting systems for apartment complexes",
            "Create repair cafes to fix items instead of discarding them",
            "Establish material exchange programs for reusable items",
            "Partner with local recyclers and waste management companies",
          ],
        },
      ],
      tips: [
        "Start small - focus on one R at a time until it becomes habit",
        "Educate family members about proper segregation techniques",
        "Track your waste reduction progress monthly",
        "Connect with local environmental groups for community initiatives",
      ],
      quiz: [
        {
          question: "Which R should be prioritized first in waste management?",
          options: ["Recycle", "Reduce", "Refuse", "Reuse"],
          correct: 2,
        },
        {
          question: "What percentage of home waste can typically be composted?",
          options: ["20%", "30%", "40%", "50%"],
          correct: 2,
        },
        {
          question: "How often should you turn your compost pile?",
          options: ["Daily", "Weekly", "Every 2 weeks", "Monthly"],
          correct: 2,
        },
      ],
    },
  },
  "energy-conservation": {
    id: "energy-conservation",
    title: "Energy Conservation & Efficiency",
    category: "energy",
    icon: Zap,
    coverImage: "/led-light-bulbs-and-solar-panels-with-energy-savin.jpg",
    duration: "9 min read",
    points: 18,
    content: {
      introduction:
        "Energy conservation reduces greenhouse gas emissions and saves money. The average household can reduce energy consumption by 25-30% through simple behavioral changes and efficient technologies.",
      sections: [
        {
          title: "Understanding Energy Consumption at Home",
          content: [
            "Heating/Cooling: 45% of home energy use - biggest impact area",
            "Water Heating: 18% - second largest consumer",
            "Lighting: 12% - easy wins with LED conversion",
            "Electronics: 11% - phantom loads add up",
            "Appliances: 9% - efficiency ratings matter",
            "Other: 5% - cooking, small appliances",
          ],
        },
        {
          title: "Lighting Efficiency Revolution",
          content: [
            "LED vs Incandescent: LEDs use 75% less energy, last 25x longer",
            "Cost Comparison: LED pays for itself in 6 months through energy savings",
            "Quality Matters: Choose LEDs with good color rendering (CRI 80+)",
            "Smart Controls: Dimmer switches, motion sensors, timers reduce usage further",
            "Natural Light: Maximize daylight with mirrors, light-colored walls, clean windows",
          ],
        },
        {
          title: "Heating and Cooling Optimization",
          content: [
            "Temperature Settings: 24°C for AC, 20°C for heating saves 6-8% per degree",
            "Insulation: Seal gaps around doors, windows, reduce energy loss by 15%",
            "Fan Usage: Ceiling fans allow 3°C higher AC setting with same comfort",
            "Maintenance: Clean AC filters monthly, service annually for peak efficiency",
            "Zoning: Cool/heat only occupied rooms, close vents in unused areas",
          ],
        },
        {
          title: "Appliance Efficiency Tips",
          content: [
            "Refrigerator: Set to 3-4°C, freezer to -18°C, keep 75% full for efficiency",
            "Washing Machine: Use cold water (90% of energy goes to heating), full loads only",
            "Dishwasher: Air dry instead of heat dry, run only when full",
            "Electronics: Unplug chargers, use power strips to eliminate phantom loads",
            "Water Heater: Lower temperature to 50°C, insulate tank and pipes",
          ],
        },
        {
          title: "Renewable Energy Options",
          content: [
            "Solar Water Heaters: 60-70% reduction in water heating costs, 3-5 year payback",
            "Solar Panels: Grid-tied systems with net metering, 20-25 year lifespan",
            "Solar Cookers: Use sun's energy for cooking, reduces LPG consumption",
            "Wind Power: Small residential turbines for windy areas",
            "Government Incentives: Subsidies and tax benefits for renewable installations",
          ],
        },
      ],
      tips: [
        "Conduct home energy audit to identify biggest opportunities",
        "Replace appliances with 5-star energy rated models when upgrading",
        "Use programmable thermostats to optimize heating/cooling schedules",
        "Consider time-of-use electricity rates to shift usage to off-peak hours",
      ],
      quiz: [
        {
          question: "What percentage of home energy is used for heating/cooling?",
          options: ["25%", "35%", "45%", "55%"],
          correct: 2,
        },
        {
          question: "How much energy do LEDs save compared to incandescent bulbs?",
          options: ["50%", "60%", "75%", "85%"],
          correct: 2,
        },
        {
          question: "What is the optimal AC temperature setting?",
          options: ["22°C", "23°C", "24°C", "25°C"],
          correct: 2,
        },
      ],
    },
  },
  "water-conservation": {
    id: "water-conservation",
    title: "Water Conservation & Management",
    category: "water",
    icon: Droplets,
    coverImage: "/rainwater-harvesting-system-and-water-conservation.jpg",
    duration: "7 min read",
    points: 16,
    content: {
      introduction:
        "Water scarcity affects 2 billion people globally. India faces severe water stress with demand exceeding supply by 2030. Conservation techniques can reduce household water usage by 30-50% while maintaining quality of life.",
      sections: [
        {
          title: "Household Water Usage Breakdown",
          content: [
            "Bathroom: 70% of total usage - toilets (24%), showers (20%), faucets (19%), leaks (7%)",
            "Laundry: 16% - washing machines and hand washing",
            "Kitchen: 9% - cooking, cleaning, drinking water",
            "Outdoor: 5% - garden watering, car washing",
            "Hidden Losses: Leaks can waste 10,000+ gallons annually per household",
          ],
        },
        {
          title: "Bathroom Water Conservation",
          content: [
            "Shower Efficiency: 5-minute showers save 12-25 gallons, low-flow showerheads reduce usage 40%",
            "Toilet Upgrades: Dual-flush toilets save 67% water, displacement bags in old tanks help",
            "Faucet Fixes: Repair drips immediately - one drop per second wastes 5 gallons daily",
            "Behavioral Changes: Turn off tap while brushing teeth, take shorter showers",
            "Greywater Systems: Reuse shower/sink water for toilet flushing, garden irrigation",
          ],
        },
        {
          title: "Rainwater Harvesting Systems",
          content: [
            "Catchment Calculation: 1 inch rain on 1000 sq ft roof = 623 gallons collected",
            "Components: Gutters, downspouts, first-flush diverters, storage tanks, distribution",
            "Storage Options: Plastic tanks (affordable), concrete cisterns (durable), underground systems",
            "Water Quality: First-flush diverters remove debris, filters ensure clean storage",
            "Uses: Garden irrigation, toilet flushing, groundwater recharge, emergency supply",
          ],
        },
        {
          title: "Garden and Outdoor Conservation",
          content: [
            "Drip Irrigation: 90% efficiency vs 65% for sprinklers, delivers water directly to roots",
            "Plant Selection: Native, drought-resistant species need 50% less water",
            "Mulching: 2-3 inch layer reduces evaporation by 70%, suppresses weeds",
            "Timing: Water early morning (6-8 AM) or evening to minimize evaporation",
            "Soil Improvement: Compost increases water retention, reduces runoff",
          ],
        },
        {
          title: "Greywater and Blackwater Management",
          content: [
            "Greywater Sources: Bathroom sinks, showers, washing machines (not toilets/kitchen)",
            "Simple Systems: Laundry-to-landscape, shower diverters for immediate garden use",
            "Treatment Levels: Basic filtration for irrigation, advanced treatment for indoor reuse",
            "Safety Guidelines: Use biodegradable soaps, avoid contact with edible plant parts",
            "Regulations: Check local codes, permits may be required for permanent systems",
          ],
        },
      ],
      tips: [
        "Install water meters to track usage and identify conservation opportunities",
        "Fix leaks promptly - they're often the biggest source of waste",
        "Collect cold water while waiting for hot water to use for plants",
        "Use a broom instead of hose for cleaning driveways and sidewalks",
      ],
      quiz: [
        {
          question: "What percentage of household water is used in bathrooms?",
          options: ["50%", "60%", "70%", "80%"],
          correct: 2,
        },
        {
          question: "How much water can be collected from 1 inch of rain on 1000 sq ft?",
          options: ["423 gallons", "523 gallons", "623 gallons", "723 gallons"],
          correct: 2,
        },
        {
          question: "What is the efficiency of drip irrigation systems?",
          options: ["70%", "80%", "90%", "95%"],
          correct: 2,
        },
      ],
    },
  },
}

export default function LessonPage() {
  return (
    <AuthGuard requiredRole="student">
      <LessonContent />
    </AuthGuard>
  )
}

function LessonContent() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [showQuiz, setShowQuiz] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [progress, setProgress] = useState(0)

  const lessonId = params.id as string
  const lesson = lessons[lessonId as keyof typeof lessons]

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = getCurrentUserFromSession()
        setUser(currentUser)

        if (currentUser) {
          const lessonProgress = await getUserLessonProgress(currentUser.id, lessonId)
          setCompleted(lessonProgress.completed)
          setProgress(lessonProgress.progress)
        }
      } catch (error) {
        console.error('Error loading lesson data:', error)
      }
    }

    loadUserData()
  }, [lessonId])

  useEffect(() => {
    if (lesson) {
      const totalSections = lesson.content.sections.length + 1 // +1 for quiz
      const newProgress = ((currentSection + (showQuiz ? 1 : 0)) / totalSections) * 100
      setProgress(newProgress)
    }
  }, [currentSection, showQuiz, lesson])

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const handleCompleteLesson = async () => {
    if (user) {
      try {
        await completeLesson(user.id, lessonId, lesson.points)
        setCompleted(true)
        router.push("/student?tab=lessons")
      } catch (error) {
        console.error('Error completing lesson:', error)
      }
    }
  }

  const handleQuizSubmit = () => {
    const correctAnswers = quizAnswers.filter((answer, index) => answer === lesson.content.quiz[index].correct).length

    if (correctAnswers >= Math.ceil(lesson.content.quiz.length * 0.7)) {
      handleCompleteLesson()
    } else {
      alert(
        `You need ${Math.ceil(lesson.content.quiz.length * 0.7)} correct answers to pass. You got ${correctAnswers}. Please review the lesson and try again.`,
      )
      setShowQuiz(false)
      setCurrentSection(0)
      setQuizAnswers([])
    }
  }

  const IconComponent = lesson.icon

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <IconComponent className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">{lesson.title}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline">{lesson.duration}</Badge>
                  <Badge variant="secondary">{lesson.points} points</Badge>
                  {completed && (
                    <Badge className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {!showQuiz ? (
              <>
                {currentSection === 0 && (
                  <div className="space-y-6">
                    <img
                      src={lesson.coverImage || "/placeholder.svg"}
                      alt={lesson.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                      <p className="text-lg text-muted-foreground leading-relaxed">{lesson.content.introduction}</p>
                    </div>
                  </div>
                )}

                {currentSection > 0 && currentSection <= lesson.content.sections.length && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">{lesson.content.sections[currentSection - 1].title}</h2>
                      <div className="space-y-4">
                        {lesson.content.sections[currentSection - 1].content.map((item, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-muted-foreground leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentSection === lesson.content.sections.length + 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Key Tips & Takeaways</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lesson.content.tips.map((tip, index) => (
                        <div key={index} className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <p className="text-sm font-medium text-primary">💡 Tip {index + 1}</p>
                          <p className="text-muted-foreground mt-1">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                    disabled={currentSection === 0}
                  >
                    Previous
                  </Button>

                  {currentSection < lesson.content.sections.length + 1 ? (
                    <Button onClick={() => setCurrentSection(currentSection + 1)}>Next</Button>
                  ) : (
                    <Button onClick={() => setShowQuiz(true)}>Take Quiz</Button>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Knowledge Check</h2>
                <p className="text-muted-foreground mb-6">
                  Answer at least {Math.ceil(lesson.content.quiz.length * 0.7)} questions correctly to complete the
                  lesson.
                </p>

                {lesson.content.quiz.map((question, qIndex) => (
                  <div key={qIndex} className="space-y-4 p-6 border rounded-lg">
                    <h3 className="font-semibold">
                      {qIndex + 1}. {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <label key={oIndex} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            value={oIndex}
                            onChange={() => {
                              const newAnswers = [...quizAnswers]
                              newAnswers[qIndex] = oIndex
                              setQuizAnswers(newAnswers)
                            }}
                            className="text-primary"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setShowQuiz(false)}>
                    Review Lesson
                  </Button>
                  <Button onClick={handleQuizSubmit} disabled={quizAnswers.length < lesson.content.quiz.length}>
                    Submit Quiz
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
