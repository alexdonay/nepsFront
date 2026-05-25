import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Password } from "primereact/password";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PERMISSIONS } from "../../constants/permissions";
import { repository } from "../../services/repository";
import { normalizePermission } from "../../utils/auth";

const normalizeErrorMessage = (err) => {
  const detail = err?.response?.data?.detail;

  if (!detail) return err?.message || "Erro ao salvar usuário";

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.msg) return item.msg;
        if (item?.message) return item.message;
        return JSON.stringify(item);
      })
      .join(" | ");
  }

  if (typeof detail === "object") {
    return detail.msg || detail.message || JSON.stringify(detail);
  }

  return String(detail);
};

export default function UserForm() {
  const { id } = useParams();
  const isEdit = !!id;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [institutions, setInstitutions] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // carregar options
    repository.institutions
      .get()
      .then((r) => setInstitutions(r.data?.items || r.data || []))
      .catch(() => setInstitutions([]));

    repository.healthUnits
      .get()
      .then((r) => setUnits(r.data?.items || r.data || []))
      .catch(() => setUnits([]));

    // carregar dados do usuário se em modo de edição
    if (isEdit) {
      repository.users
        .getById(id)
        .then((r) => {
          const user = r.data;
          setName(user.name || "");
          setEmail(user.email || "");
          setProfile(normalizePermission(user.role) || null);
          setIsActive(user.is_active ?? user.active ?? true);
          const institutionId =
            user.education_institute_id ??
            user.institution_id ??
            user.education_institute?.id ??
            null;
          const unitId =
            user.service_id ?? user.health_unit_id ?? user.service?.id ?? null;

          if (institutionId) setSelectedInstitution(institutionId);
          if (unitId) setSelectedUnit(unitId);
        })
        .catch(() => {
          setError("Erro ao carregar usuário");
        });
    }
  }, [id, isEdit]);

  const profileOptions = [
    { label: "Administrador", value: PERMISSIONS.ADMIN },
    { label: "Instituição de Ensino", value: PERMISSIONS.INSTITUICAO_ENSINO },
    { label: "Serviço", value: PERMISSIONS.UNIDADE_SAUDE },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = isEdit
        ? {
            name,
            email,
            role: profile,
            is_active: isActive,
          }
        : {
            name,
            email,
            role: profile,
            is_active: isActive,
          };

      if (!isEdit) {
        // incluir senha apenas na criação
        if (!password) throw new Error("Senha é obrigatória");
        payload.password = password;

        if (profile === PERMISSIONS.INSTITUICAO_ENSINO) {
          if (!selectedInstitution) throw new Error("Selecione a instituição");
          payload.education_institute_id =
            selectedInstitution.id ?? selectedInstitution;
        }

        if (profile === PERMISSIONS.UNIDADE_SAUDE) {
          if (!selectedUnit) throw new Error("Selecione o serviço");
          const unitId = selectedUnit.id ?? selectedUnit;
          payload.health_unit_id = unitId;
          payload.service_id = unitId;
        }
      }

      if (isEdit) {
        await repository.users.put(id, payload);
        setSuccess("Usuário atualizado com sucesso.");
      } else {
        await repository.users.post(payload);
        setSuccess("Usuário criado com sucesso.");
      }

      setTimeout(() => navigate("/users"), 1000);
    } catch (err) {
      setError(normalizeErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-900 mb-3">
        {isEdit ? "Editar Usuário" : "Novo Usuário"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-column gap-3 max-w-2xl"
      >
        <div>
          <label className="block mb-1">Nome</label>
          <InputText
            value={name ?? ""}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-1">E-mail</label>
          <InputText
            value={email ?? ""}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-1">Senha {!isEdit && "*"}</label>
          <Password
            value={password ?? ""}
            onChange={(e) => setPassword(e.target.value)}
            required={!isEdit}
            toggleMask
            className="w-full"
            placeholder={
              isEdit ? "Deixe em branco para manter a senha atual" : ""
            }
          />
        </div>

        <div>
          <label className="block mb-1">Perfil de Acesso</label>
          <Dropdown
            value={profile ?? null}
            onChange={(e) => setProfile(e.value)}
            options={profileOptions}
            placeholder="Selecione o perfil"
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-1">Status</label>
          <Dropdown
            value={isActive ?? true}
            onChange={(e) => setIsActive(e.value)}
            options={[
              { label: "Ativo", value: true },
              { label: "Inativo", value: false },
            ]}
            placeholder="Selecione o status"
            className="w-full"
          />
        </div>

        {profile === PERMISSIONS.INSTITUICAO_ENSINO && (
          <div>
            <label className="block mb-1">Instituição</label>
            <Dropdown
              value={selectedInstitution ?? null}
              options={institutions}
              onChange={(e) => setSelectedInstitution(e.value)}
              optionLabel="name"
              optionValue="id"
              placeholder="Selecione uma instituição"
              className="w-full"
            />
          </div>
        )}

        {profile === PERMISSIONS.UNIDADE_SAUDE && (
          <div>
            <label className="block mb-1">Serviço</label>
            <Dropdown
              value={selectedUnit ?? null}
              options={units}
              onChange={(e) => setSelectedUnit(e.value)}
              optionLabel="name"
              optionValue="id"
              placeholder="Selecione um serviço"
              className="w-full"
            />
          </div>
        )}

        {error && <Message severity="error" text={error} />}
        {success && <Message severity="success" text={success} />}

        <div className="flex gap-2">
          <Button
            label={isEdit ? "Atualizar" : "Criar"}
            type="submit"
            loading={loading}
          />
          <Button
            label="Cancelar"
            className="p-button-text"
            onClick={() => navigate("/users")}
          />
        </div>
      </form>
    </div>
  );
}
