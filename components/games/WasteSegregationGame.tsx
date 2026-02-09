"use client"

import { useState, useEffect } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Recycle, Trash2, CheckCircle, XCircle } from 'lucide-react'

interface TrashItem {
    id: number
    name: string
    type: 'wet' | 'dry'
    emoji: string
}

const TRASH_ITEMS: TrashItem[] = [
    { id: 1, name: 'Banana Peel', type: 'wet', emoji: '🍌' },
    { id: 2, name: 'Plastic Bottle', type: 'dry', emoji: '🍾' },
    { id: 3, name: 'Apple Core', type: 'wet', emoji: '🍎' },
    { id: 4, name: 'Paper', type: 'dry', emoji: '📄' },
    { id: 5, name: 'Food Waste', type: 'wet', emoji: '🍽️' },
    { id: 6, name: 'Cardboard', type: 'dry', emoji: '📦' },
    { id: 7, name: 'Vegetable Scraps', type: 'wet', emoji: '🥬' },
    { id: 8, name: 'Plastic Bag', type: 'dry', emoji: '🛍️' },
    { id: 9, name: 'Orange Peel', type: 'wet', emoji: '🍊' },
    { id: 10, name: 'Metal Can', type: 'dry', emoji: '🥫' },
    { id: 11, name: 'Eggshells', type: 'wet', emoji: '🥚' },
    { id: 12, name: 'Glass Bottle', type: 'dry', emoji: '🍶' },
]

interface DraggableItemProps {
    item: TrashItem
    onDrop: () => void
}

function DraggableItem({ item, onDrop }: DraggableItemProps) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'trash',
        item: { id: item.id, type: item.type },
        end: (item, monitor) => {
            if (monitor.didDrop()) {
                onDrop()
            }
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }))

    return (
        <div
            ref={drag}
            className={`cursor-grab active:cursor-grabbing p-4 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all ${isDragging ? 'opacity-50 scale-95' : ''
                }`}
        >
            <div className="text-4xl mb-2 text-center">{item.emoji}</div>
            <div className="text-sm font-medium text-center">{item.name}</div>
        </div>
    )
}

interface BinProps {
    type: 'wet' | 'dry'
    onDrop: (itemType: string) => void
}

function Bin({ type, onDrop }: BinProps) {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: 'trash',
        drop: (item: { id: number; type: string }) => {
            onDrop(item.type)
            return { type }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    }))

    const bgColor = type === 'wet' ? 'bg-green-100' : 'bg-blue-100'
    const borderColor = type === 'wet' ? 'border-green-500' : 'border-blue-500'
    const hoverColor = isOver ? (type === 'wet' ? 'bg-green-200' : 'bg-blue-200') : ''

    return (
        <div
            ref={drop}
            className={`${bgColor} ${borderColor} ${hoverColor} border-4 border-dashed rounded-2xl p-8 min-h-[200px] flex flex-col items-center justify-center transition-colors`}
        >
            <Recycle className={`h-16 w-16 mb-4 ${type === 'wet' ? 'text-green-600' : 'text-blue-600'}`} />
            <h3 className="text-2xl font-bold mb-2">{type === 'wet' ? 'Wet Waste' : 'Dry Waste'}</h3>
            <p className="text-sm text-muted-foreground text-center">
                {type === 'wet' ? 'Food scraps, peels, organic waste' : 'Paper, plastic, metal, glass'}
            </p>
        </div>
    )
}

interface WasteSegregationGameProps {
    onComplete: (score: number) => void
    isSubmitting: boolean
}

function WasteSegregationGameContent({ onComplete, isSubmitting }: WasteSegregationGameProps) {
    const [availableItems, setAvailableItems] = useState<TrashItem[]>(TRASH_ITEMS)
    const [correctCount, setCorrectCount] = useState(0)
    const [incorrectCount, setIncorrectCount] = useState(0)
    const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string } | null>(null)

    const totalItems = TRASH_ITEMS.length
    const itemsPlaced = correctCount + incorrectCount
    const progress = (itemsPlaced / totalItems) * 100
    const accuracy = itemsPlaced > 0 ? (correctCount / itemsPlaced) * 100 : 0

    const handleDrop = (itemType: string, binType: string) => {
        const isCorrect = itemType === binType

        if (isCorrect) {
            setCorrectCount(prev => prev + 1)
            setFeedback({ type: 'correct', message: '✓ Correct!' })
        } else {
            setIncorrectCount(prev => prev + 1)
            setFeedback({ type: 'incorrect', message: '✗ Wrong bin! Try again.' })
        }

        // Clear feedback after 1.5 seconds
        setTimeout(() => setFeedback(null), 1500)
    }

    const handleItemDropped = (itemId: number) => {
        setAvailableItems(prev => prev.filter(item => item.id !== itemId))
    }

    useEffect(() => {
        if (availableItems.length === 0 && accuracy >= 80 && !isSubmitting) {
            const score = Math.round(accuracy)
            setTimeout(() => onComplete(score), 500)
        }
    }, [availableItems.length, accuracy, isSubmitting, onComplete])

    return (
        <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-green-600" />
                    Mission: Segregate Waste Correctly
                </h3>
                <p className="text-sm text-muted-foreground">
                    Drag each item to the correct bin. Wet waste includes organic materials, while dry waste includes recyclables.
                </p>
            </div>

            {/* Progress & Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
                    <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">{accuracy.toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
            </div>

            <Progress value={progress} className="h-3" />

            {/* Feedback */}
            {feedback && (
                <div className={`p-3 rounded-lg text-center font-semibold ${feedback.type === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {feedback.message}
                </div>
            )}

            {/* Bins */}
            <div className="grid md:grid-cols-2 gap-6">
                <Bin type="wet" onDrop={(itemType) => handleDrop(itemType, 'wet')} />
                <Bin type="dry" onDrop={(itemType) => handleDrop(itemType, 'dry')} />
            </div>

            {/* Available Items */}
            {availableItems.length > 0 ? (
                <div>
                    <h3 className="font-semibold mb-3">Drag items to the correct bin:</h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {availableItems.map(item => (
                            <DraggableItem
                                key={item.id}
                                item={item}
                                onDrop={() => handleItemDropped(item.id)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    {accuracy >= 80 ? (
                        <div className="text-green-600">
                            <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold">Great Job!</h3>
                            <p>You've segregated all waste correctly!</p>
                        </div>
                    ) : (
                        <div className="text-orange-600">
                            <XCircle className="h-16 w-16 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold">Try Again!</h3>
                            <p>You need at least 80% accuracy to complete this game.</p>
                            <Button onClick={() => {
                                setAvailableItems(TRASH_ITEMS)
                                setCorrectCount(0)
                                setIncorrectCount(0)
                            }} className="mt-4">
                                Restart
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">♻️ Waste Segregation Tip:</h4>
                <p className="text-sm text-muted-foreground">
                    Proper waste segregation helps in recycling and composting, reducing landfill waste by up to 50%!
                </p>
            </div>
        </div>
    )
}

export function WasteSegregationGame(props: WasteSegregationGameProps) {
    return (
        <DndProvider backend={HTML5Backend}>
            <WasteSegregationGameContent {...props} />
        </DndProvider>
    )
}
