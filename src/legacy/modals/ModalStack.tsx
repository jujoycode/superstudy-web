import { cloneElement, ReactElement, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { atom, useRecoilState } from 'recoil';

const modalsAtom = atom<ReactElement[]>({ key: 'modalsAtom', default: [] });

export function useModals() {
  const [modals, setModals] = useRecoilState(modalsAtom);

  function pushModal(modal: ReactElement) {
    setModals((prev) => [...prev, modal]);
  }

  function popModal() {
    setModals((prev) => prev.slice(0, -1));
  }

  function clearModals() {
    setModals([]);
  }

  return { modals, setModals, pushModal, popModal, clearModals };
}

export function ModalStack() {
  const { pathname } = useLocation();
  const { modals, clearModals } = useModals();

  useEffect(() => clearModals, [pathname]);

  return <>{modals.map((modal, key) => cloneElement(modal, { key }))}</>;
}
