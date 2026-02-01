

## Plano: Adicionar Estrelas de Avaliação nos Depoimentos

### Visão Geral
Adicionar avaliação com estrelas (5 estrelas) em cada card de depoimento para maior impacto visual e credibilidade.

---

### Alterações na Estrutura de Dados

**Arquivo:** `src/pages/public/Landing.tsx`

**Atualizar o array `testimonials` (linhas 30-55):**

```tsx
const testimonials = [
  {
    name: 'Maria S.',
    role: 'Paciente',
    initials: 'MS',
    rating: 5,
    quote: 'O 149Psi me ajudou a entender melhor minhas emoções. Agora minhas sessões são muito mais produtivas.',
  },
  {
    name: 'Dr. Carlos M.',
    role: 'Terapeuta',
    initials: 'CM',
    rating: 5,
    quote: 'Ter acesso aos registros dos meus pacientes entre as sessões revolucionou minha prática clínica.',
  },
  {
    name: 'Ana P.',
    role: 'Paciente',
    initials: 'AP',
    rating: 5,
    quote: 'O diário e os check-ins diários se tornaram parte essencial da minha rotina de autocuidado.',
  },
  {
    name: 'Dra. Juliana R.',
    role: 'Terapeuta',
    initials: 'JR',
    rating: 5,
    quote: 'A plataforma facilita muito o acompanhamento. Recomendo a todos os colegas psicólogos.',
  },
];
```

---

### Componente de Estrelas

Adicionar um componente helper para renderizar as estrelas:

```tsx
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5 mb-2">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'fill-muted text-muted'
        }`}
      />
    ))}
  </div>
);
```

---

### Layout Visual dos Cards

```text
+----------------------------------+
|   ❝ (Quote icon)                 |
|   ★★★★★  (5 estrelas)            |
|                                  |
|   "Texto do depoimento aqui..." |
|                                  |
|   [Avatar]  Nome                 |
|             Função               |
+----------------------------------+
```

---

### Alterações nos Cards

#### Mobile (Carrossel) - linhas 391-412

```tsx
<CardHeader className="pb-4">
  <Quote className="h-8 w-8 text-primary/20 mb-2" />
  <StarRating rating={testimonial.rating} />
  <p className="text-muted-foreground italic text-sm">
    "{testimonial.quote}"
  </p>
</CardHeader>
```

#### Desktop (Grid) - linhas 436-441

```tsx
<CardHeader className="pb-4">
  <Quote className="h-8 w-8 text-primary/20 mb-2" />
  <StarRating rating={testimonial.rating} />
  <p className="text-muted-foreground italic text-sm">
    "{testimonial.quote}"
  </p>
</CardHeader>
```

---

### Estilo das Estrelas

| Estado | Classe |
|--------|--------|
| **Preenchida** | `fill-yellow-400 text-yellow-400` |
| **Vazia** | `fill-muted text-muted` |
| **Tamanho** | `h-4 w-4` |
| **Espaçamento** | `gap-0.5` |

---

### Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/public/Landing.tsx` | Adicionar campo `rating` aos depoimentos, criar componente `StarRating`, e inserir estrelas em ambas versões (mobile e desktop) dos cards |

---

### Detalhes Técnicos

- **Ícone:** Reutiliza o componente `Star` do lucide-react já importado
- **Acessibilidade:** Estrelas são decorativas, sem necessidade de alt text adicional
- **Flexibilidade:** O componente suporta ratings variáveis (1-5), mas todos começam com 5 estrelas
- **Performance:** Nenhuma dependência adicional necessária

