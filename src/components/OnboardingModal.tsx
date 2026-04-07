import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Settings, Zap, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'oma-onboarding-dismissed';

export default function OnboardingModal() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShow(false);
  };

  const goToSettings = () => {
    dismiss();
    navigate('/settings/project');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl mx-4">
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Oracle Migration Accelerator</h2>
          <p className="text-sm text-muted-foreground mt-1">
            시작하기 전 아래 설정이 필요합니다
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 rounded-lg border border-border p-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              1
            </div>
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                프로젝트 설정
                <span className="text-xs text-destructive">(필수)</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Oracle/PostgreSQL DB 접속 정보, DMS 리소스 설정
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border/50 p-3 opacity-70">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
              2
            </div>
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                에이전트 설정
                <span className="text-xs text-muted-foreground">(선택)</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI 모델 및 변환 파라미터 — 기본값으로 진행 가능
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border/50 p-3 opacity-70">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
              3
            </div>
            <div>
              <p className="text-sm font-medium">
                테스트 설정
                <span className="text-xs text-muted-foreground ml-1.5">(선택)</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                바인드 변수 및 데이터 소스 — 나중에 설정 가능
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={goToSettings} className="flex-1 gap-2">
            설정 시작
          </Button>
          <Button variant="outline" onClick={dismiss} className="flex-1">
            나중에 하기
          </Button>
        </div>
      </div>
    </div>
  );
}
