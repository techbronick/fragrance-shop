import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useProducts } from "@/hooks/useProducts";
import { useCreateRecommendation } from "@/hooks/useDiscoverySets";
import { Product } from "@/types/database";
import { Sparkles, RefreshCw, ChevronRight, ChevronLeft, Flower2, Calendar, Zap, Heart, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuestionnaireData {
  currentStyle: string;
  occasions: string[];
  preferredNotes: string[];
  intensity: string;
  season: string;
  gender: string;
}

export const DiscoveryRecommendation = () => {
  const { data: products } = useProducts();
  const { mutate: createRecommendation } = useCreateRecommendation();
  const { toast } = useToast();
  
  const [step, setStep] = useState(0);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>({
    currentStyle: "",
    occasions: [],
    preferredNotes: [],
    intensity: "",
    season: "",
    gender: ""
  });
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const questions = [
    {
      id: "currentStyle",
      title: "Care este stilul tău actual de parfum?",
      subtitle: "Alege stilul care te definește cel mai bine",
      icon: Flower2,
      type: "radio",
      options: [
        { value: "fresh", label: "Proaspăt și curat", description: "Note marine, mentă, eucalipt" },
        { value: "floral", label: "Floral și romantic", description: "Trandafir, iasomie, bujor" },
        { value: "woody", label: "Lemnos și cald", description: "Lemn de santal, cedru, vetiver" },
        { value: "oriental", label: "Oriental și picant", description: "Vanilie, ambră, condimente" },
        { value: "citrus", label: "Citric și energizant", description: "Lămâie, bergamotă, grapefruit" },
        { value: "none", label: "Nu port parfum în mod regulat", description: "Sunt nou în lumea parfumurilor" }
      ]
    },
    {
      id: "occasions",
      title: "Pentru ce ocazii vrei să folosești parfumul?",
      subtitle: "Poți selecta mai multe opțiuni",
      icon: Calendar,
      type: "checkbox",
      options: [
        { value: "daily", label: "Zilnic, la birou", description: "Pentru zi de zi" },
        { value: "evening", label: "Ieșiri seara", description: "Pentru evenimente nocturne" },
        { value: "special", label: "Ocazii speciale", description: "Sărbători și evenimente importante" },
        { value: "romantic", label: "Întâlniri romantice", description: "Pentru momente intime" },
        { value: "casual", label: "Activități casual", description: "Weekend și relaxare" },
        { value: "sport", label: "Sport și activități fizice", description: "Pentru activitate intensă" }
      ]
    },
    {
      id: "preferredNotes",
      title: "Ce note îți plac cel mai mult?",
      subtitle: "Selectează aromele care te atrag",
      icon: Heart,
      type: "checkbox",
      options: [
        { value: "rose", label: "Trandafir", description: "Clasic și romantic" },
        { value: "vanilla", label: "Vanilie", description: "Dulce și cald" },
        { value: "citrus", label: "Citrice", description: "Proaspăt și energizant" },
        { value: "sandalwood", label: "Lemn de santal", description: "Catifelat și exotic" },
        { value: "musk", label: "Mosc", description: "Senzual și persistent" },
        { value: "jasmine", label: "Iasomie", description: "Floral și intoxicant" },
        { value: "bergamot", label: "Bergamotă", description: "Citric și sofisticat" },
        { value: "patchouli", label: "Patchouli", description: "Pământesc și misterios" }
      ]
    },
    {
      id: "intensity",
      title: "Ce intensitate preferi?",
      subtitle: "Alege puterea dorită a parfumului",
      icon: Zap,
      type: "radio",
      options: [
        { value: "light", label: "Ușor și subtil", description: "Discret, pentru apropiați" },
        { value: "medium", label: "Moderat", description: "Echilibrat, se simte fără a deranja" },
        { value: "strong", label: "Intens și persistent", description: "Puternic, lasă o impresie durabilă" }
      ]
    },
    {
      id: "season",
      title: "Pentru ce sezon cauți un parfum?",
      subtitle: "Fiecare sezon are propria sa aromă",
      icon: Sun,
      type: "radio",
      options: [
        { value: "spring", label: "Primăvară", description: "Proaspăt și floral" },
        { value: "summer", label: "Vară", description: "Ușor și citric" },
        { value: "autumn", label: "Toamnă", description: "Cald și condimentat" },
        { value: "winter", label: "Iarnă", description: "Intens și învăluitoare" },
        { value: "all", label: "Pentru tot anul", description: "Versatil pentru orice sezon" }
      ]
    }
  ];

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setQuestionnaire(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const generateRecommendations = () => {
    if (!products) return;
    
    setIsGenerating(true);
    
    // Simple recommendation algorithm based on questionnaire answers
    const filtered = products.filter(product => {
      const family = product.family.toLowerCase();
      const notes = [...product.notes_top, ...product.notes_mid, ...product.notes_base].join(' ').toLowerCase();
      
      // Match based on current style preference
      if (questionnaire.currentStyle) {
        if (questionnaire.currentStyle === 'fresh' && !family.includes('citrus') && !notes.includes('bergamot')) return false;
        if (questionnaire.currentStyle === 'floral' && !family.includes('floral') && !notes.includes('rose') && !notes.includes('jasmine')) return false;
        if (questionnaire.currentStyle === 'woody' && !family.includes('woody') && !notes.includes('sandalwood')) return false;
        if (questionnaire.currentStyle === 'oriental' && !family.includes('oriental') && !notes.includes('vanilla')) return false;
        if (questionnaire.currentStyle === 'citrus' && !family.includes('citrus')) return false;
      }
      
      // Match based on preferred notes
      if (questionnaire.preferredNotes.length > 0) {
        const hasPreferredNote = questionnaire.preferredNotes.some(note => 
          notes.includes(note)
        );
        if (!hasPreferredNote) return false;
      }
      
      return true;
    });
    
    // Shuffle and take first 5
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    const recommended = shuffled.slice(0, 5);
    
    setRecommendations(recommended);
    
    // Save recommendation to database
    createRecommendation({
      user_id: null, // Will be set by RLS when user is authenticated
      questionnaire_data: questionnaire,
      recommended_products: recommended.map(p => p.id)
    });
    
    setTimeout(() => {
      setIsGenerating(false);
      setStep(questions.length);
    }, 2000);
  };

  const resetQuestionnaire = () => {
    setStep(0);
    setQuestionnaire({
      currentStyle: "",
      occasions: [],
      preferredNotes: [],
      intensity: "",
      season: "",
      gender: ""
    });
    setRecommendations([]);
  };

  const currentQuestion = questions[step];
  const isLastQuestion = step === questions.length - 1;
  const canProceed = questionnaire[currentQuestion?.id as keyof QuestionnaireData];

  if (step >= questions.length) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-playfair">
              Recomandările Tale Personalizate
            </CardTitle>
            <p className="text-muted-foreground">
              Bazat pe preferințele tale, am selectat parfumurile perfecte pentru tine
            </p>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="text-center py-16">
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <RefreshCw className="h-20 w-20 text-primary animate-spin" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Generez recomandările magice...</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Analizez cu atenție răspunsurile tale pentru a descoperi parfumurile care se potrivesc perfect personalității tale
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((product, index) => (
                    <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-primary/10">
                      <CardContent className="p-0">
                        <div className="relative">
                          <div className="aspect-square rounded-t-lg overflow-hidden">
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white font-semibold">
                              #{index + 1} Recomandat
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <h4 className="font-semibold text-lg">{product.brand}</h4>
                            <p className="text-muted-foreground">{product.name}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {product.notes_top.slice(0, 3).map(note => (
                              <Badge key={note} variant="outline" className="text-xs border-primary/30 text-primary">
                                {note}
                              </Badge>
                            ))}
                          </div>
                          <Button className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                            Vezi Detalii
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6 border-t">
                  <Button variant="outline" onClick={resetQuestionnaire} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Încearcă din Nou
                  </Button>
                  <Button className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80">
                    <Sparkles className="h-4 w-4" />
                    Creează Set cu Aceste Parfumuri
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const IconComponent = currentQuestion.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Descoperă-ți Parfumul Perfect</h2>
                <p className="text-sm text-muted-foreground">Doar câteva întrebări simple</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
              {step + 1} din {questions.length}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progres</span>
                <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-secondary/50 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Question */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-playfair font-semibold text-foreground">
                  {currentQuestion.title}
                </h3>
                <p className="text-muted-foreground">
                  {currentQuestion.subtitle}
                </p>
              </div>
              
              {/* Radio Options */}
              {currentQuestion.type === "radio" && (
                <RadioGroup 
                  value={questionnaire[currentQuestion.id as keyof QuestionnaireData] as string}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  className="space-y-3"
                >
                  {currentQuestion.options.map(option => (
                    <div key={option.value} className="relative">
                      <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                        <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                          <div className="space-y-1">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {/* Checkbox Options */}
              {currentQuestion.type === "checkbox" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentQuestion.options.map(option => (
                    <div key={option.value} className="relative">
                      <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                        <Checkbox 
                          id={option.value}
                          checked={(questionnaire[currentQuestion.id as keyof QuestionnaireData] as string[])?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const current = (questionnaire[currentQuestion.id as keyof QuestionnaireData] as string[]) || [];
                            if (checked) {
                              handleAnswerChange(currentQuestion.id, [...current, option.value]);
                            } else {
                              handleAnswerChange(currentQuestion.id, current.filter(v => v !== option.value));
                            }
                          }}
                          className="mt-1"
                        />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                          <div className="space-y-1">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Înapoi
              </Button>
              
              {isLastQuestion ? (
                <Button 
                  onClick={generateRecommendations}
                  disabled={!canProceed}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Sparkles className="h-4 w-4" />
                  Generează Recomandări Magice
                </Button>
              ) : (
                <Button 
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed}
                  className="flex items-center gap-2"
                >
                  Următorul
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
