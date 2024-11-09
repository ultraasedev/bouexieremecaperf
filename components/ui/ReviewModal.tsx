// components/ui/ReviewModal.tsx
'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewAdded: () => void;
}

export function ReviewModal({ isOpen, onClose, onReviewAdded }: ReviewModalProps) {
  const initialFormState = {
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    service: '',
    rating: 0,
    text: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      toast.success('Merci ! Votre avis a bien été publié.');
      handleClose();
      onReviewAdded();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-black border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-semibold text-white">
                    Publier un avis
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nom et Prénom */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        value={formData.firstName}
                        onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        value={formData.lastName}
                        onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="votre@email.com"
                    />
                  </div>

                  {/* Ville */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Ville <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={formData.location}
                      onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Votre ville"
                    />
                  </div>

                  {/* Service */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Prestation effectuée <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full rounded-lg bg-white border-0 px-3 py-2 text-black focus:ring-2 focus:ring-red-500"
                      value={formData.service}
                      onChange={e => setFormData(prev => ({ ...prev, service: e.target.value }))}
                    >
                      <option value="">Sélectionnez une prestation</option>
                      <option value="Diagnostic">Diagnostic</option>
                      <option value="Mécanique">Mécanique</option>
                      <option value="Pièces Premium">Pièces Premium</option>
                      <option value="Reprogrammation">Reprogrammation</option>
                      <option value="Entretien">Entretien</option>
                    </select>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Note <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          {star <= formData.rating ? (
                            <StarIcon className="h-8 w-8 text-red-500" />
                          ) : (
                            <StarOutline className="h-8 w-8 text-red-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Votre avis <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      value={formData.text}
                      onChange={e => setFormData(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Partagez votre expérience..."
                    />
                  </div>

                  {/* Boutons */}
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 rounded-full text-white hover:bg-white/10 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2 font-medium disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Publication...' : 'Publier'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}