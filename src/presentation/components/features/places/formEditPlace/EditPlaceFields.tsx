import { ChevronDown } from 'lucide-react';

interface EditPlaceFieldsProps {
  formData: { name: string; description: string; address: string; categoryId: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  categories: { id: string; name: string }[];
}

const EditPlaceFields: React.FC<EditPlaceFieldsProps> = ({ formData, handleChange, categories }) => (
  <>
    <div>
      <label className="text-xs font-semibold text-lg-dim uppercase">Nombre</label>
      <input type="text" name="name" value={formData.name} onChange={handleChange}
        className="w-full px-4 py-3 bg-lg-surface-2 border border-lg-surface-2 rounded-xl text-sm outline-none focus:border-primary-400" />
    </div>
    <div>
      <label className="text-xs font-semibold text-lg-dim uppercase">Categoría</label>
      <div className="relative">
        <select name="categoryId" value={formData.categoryId} onChange={handleChange}
          className="w-full px-4 py-3 bg-lg-surface-2 border border-lg-surface-2 rounded-xl text-sm appearance-none cursor-pointer outline-none focus:border-primary-400">
          <option value="">Selecciona una categoría</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lg-dim pointer-events-none" />
      </div>
    </div>
    <div>
      <label className="text-xs font-semibold text-lg-dim uppercase">Descripción</label>
      <textarea name="description" value={formData.description} onChange={handleChange}
        className="w-full px-4 py-3 bg-lg-surface-2 border border-lg-surface-2 rounded-xl text-sm outline-none focus:border-primary-400 resize-none" rows={4} />
    </div>
    <div>
      <label className="text-xs font-semibold text-lg-dim uppercase">Dirección</label>
      <input type="text" name="address" value={formData.address} onChange={handleChange}
        className="w-full px-4 py-3 bg-lg-surface-2 border border-lg-surface-2 rounded-xl text-sm outline-none focus:border-primary-400" />
    </div>
  </>
);

export default EditPlaceFields;
