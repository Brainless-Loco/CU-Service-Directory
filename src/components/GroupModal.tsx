import React, { useState, useEffect } from 'react';
import { X, FolderPlus, AlertCircle } from 'lucide-react';
import { ServiceGroup } from '../types';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: ServiceGroup) => void;
  groupToEdit?: ServiceGroup | null;
}

export const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  groupToEdit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [color, setColor] = useState('emerald');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (groupToEdit) {
      setName(groupToEdit.name);
      setDescription(groupToEdit.description);
      setOrder(groupToEdit.order);
      setColor(groupToEdit.color || 'emerald');
    } else {
      setName('');
      setDescription('');
      setOrder(1);
      setColor('emerald');
    }
    setFormError(null);
  }, [groupToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category group name is required.');
      return;
    }

    const saved: ServiceGroup = {
      id: groupToEdit ? groupToEdit.id : 'group-' + name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: name.trim(),
      description: description.trim(),
      order: Number(order) || 1,
      color,
    };

    onSave(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {groupToEdit ? 'Edit Category Group' : 'Create Category Group'}
              </h2>
              <p className="text-xs text-slate-500">Organize service cards under categories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Research & Innovation"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of services categorized under this group..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Display Order</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Color Accent</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="emerald">Emerald</option>
                <option value="sky">Sky Blue</option>
                <option value="indigo">Indigo</option>
                <option value="amber">Amber</option>
                <option value="teal">Teal</option>
                <option value="rose">Rose</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              Save Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
