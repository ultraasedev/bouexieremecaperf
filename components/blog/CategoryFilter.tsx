// components/blog/CategoryFilter.tsx
interface CategoryFilterProps {
    categories: { id: string; name: string }[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
  }
  
  export default function CategoryFilter({
    categories,
    selectedCategory,
    onSelectCategory,
  }: CategoryFilterProps) {
    return (
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all
              ${selectedCategory === category.id 
                ? 'bg-red-600 text-white' 
                : 'bg-white/10 text-white hover:bg-white/20'
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    );
  }
  