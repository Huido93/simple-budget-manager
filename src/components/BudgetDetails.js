import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from './../api/axiosInstance';
import { Container, Card, Button, Table, Form, Col, Row, ProgressBar, Collapse } from 'react-bootstrap';
import ExpenditureModal from './ExpenditureModal';
import BudgetExpenditureChart from './BudgetExpenditureChart';
import BudgetModal from './BudgetModal';

const BudgetDetails = () => {
  const { id } = useParams();
  const [budget, setBudget] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [totalExpense, setTotalExpense] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showExpenditureChart, setShowExpenditureChart] = useState(false);
  const [expenditureInput, setExpenditureInput] = useState({
    date: '',
    amount: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const response = await axiosInstance.get(`/api/budgets/${id}`);
        setBudget(response.data);
      } catch (error) {
        console.error('예산 정보를 불러오는 중 오류 발생:', error);
      }
    };

    fetchBudget();
  }, [id]);

  // 전체 지출 계산
  const totalSpent = budget?.expenditures?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  const remainingBudget = budget?.totalAmount ? budget.totalAmount - totalSpent : 0;
  const totalSpendingPercentage = budget?.totalAmount ? (totalSpent / budget.totalAmount) * 100 : 0;

  // 카테고리 선택 시 정보 업데이트
  const handleCategoryChange = (e) => {
    const categoryName = e.target.value;
    setSelectedCategory(categoryName);

    const category = budget.categories.find((cat) => cat.name === categoryName);
    setSelectedAmount(category ? category.amount : null);

    const categoryExpenses = budget.expenditures
      .filter((exp) => exp.category === categoryName)
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    setTotalExpense(categoryExpenses);
  };

  // 카테고리별 잔액 및 비율 계산
  const remainingBalance = selectedAmount ? selectedAmount - totalExpense : 0;
  const spendingPercentage = selectedAmount ? (totalExpense / selectedAmount) * 100 : 0;

  // 지출 추가
  const saveExpenditure = async () => {
    try {
      const response = await axiosInstance.post(`/api/budgets/${id}/expenditures`, expenditureInput);
      setBudget(response.data);
      setShowModal(false);
      setExpenditureInput({ date: '', amount: '', category: '', description: '' });
    } catch (error) {
      console.error('지출을 저장하는 중 오류 발생:', error);
    }
  };

  // 지출 삭제
  const deleteExpenditure = async (expenditureId) => {
    try {
      const response = await axiosInstance.delete(`/api/budgets/${id}/expenditures/${expenditureId}`);
      setBudget(response.data);
    } catch (error) {
      console.error('지출 삭제 중 오류 발생:', error);
    }
  };

  if (!budget) {
    return <div>로딩 중...</div>;
  }

  // Function to update budget instantly after edit
  const handleUpdateBudget = (updatedBudget) => {
    setBudget(updatedBudget); // Instantly update state with new budget data
  };

  const deleteBudget = async () => {
    if (!window.confirm("정말 이 예산을 삭제하시겠습니까? ❌")) return;
  
    try {
      await axiosInstance.delete(`/api/budgets/${id}`);
      alert("예산이 삭제되었습니다.");
      window.location.href = "/"; // Redirect to homepage after deletion
    } catch (error) {
      console.error("예산 삭제 중 오류 발생:", error);
      alert("예산 삭제 실패. 다시 시도해주세요.");
    }
  };

  return (
    <Container className="mt-5">
      {/* 예산 정보 카드 */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <h3>📊 {budget.name}</h3>
            </Col>
            <Col className="text-end">
              <Button variant="warning" onClick={() => setShowBudgetModal(true)} className="me-2">
                ✏️ 예산 수정
              </Button>
              <Button variant="danger" onClick={deleteBudget}>
                🗑️
              </Button>
            </Col>
          </Row>

          <p>{budget.description}</p>
          <h5>💰 <strong>총 예산:</strong> ₩{budget.totalAmount.toLocaleString()}</h5>
        </Card.Body>
      </Card>
      {/* Progress Bar Card - Clickable */}
      <Card className="mb-4 shadow-sm p-3 bg-light clickable-card" onClick={() => setShowExpenditureChart(!showExpenditureChart)}>
        <Card.Body>
          <h5>💰 총 지출 현황</h5>
          <Row>
            <Col>
              <p className="mb-2">
                💸 <strong>총 지출:</strong> ₩{totalSpent.toLocaleString()}
              </p>
            </Col>
            <Col>
              <p>
                💸 <strong>잔액:</strong> ₩{remainingBudget.toLocaleString()}
              </p>
            </Col>                    
          </Row>
          <ProgressBar
            now={totalSpendingPercentage}
            label={`${totalSpendingPercentage.toFixed(1)}%`}
            variant={totalSpendingPercentage >= 100 ? 'danger' : 'primary'}
          />
          <h5 className='mt-4'>📂 카테고리별 지출 현황</h5>
          <Form>
            <Row>
              <Col sm={6}>
                <Form.Group controlId="categorySelect">
                  <Form.Label>카테고리 선택</Form.Label>
                  <Form.Select value={selectedCategory} onChange={handleCategoryChange}>
                    <option value="">카테고리를 선택하세요</option>
                    {budget.categories.map((cat, index) => (
                      <option key={index} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              {selectedCategory && (
                <Col sm={6} className='mt-2'>
                  <p>💸 <strong>총 예산:</strong> ₩{selectedAmount.toLocaleString()}</p>
                  <p>💸 <strong>총 지출:</strong> ₩{totalExpense.toLocaleString()}</p>
                </Col>
              )}
              <Col>
              <p>💵 <strong>잔액:</strong> ₩{remainingBalance.toLocaleString()}</p>
                <ProgressBar
                      now={spendingPercentage}
                      label={`${spendingPercentage.toFixed(1)}%`}
                      variant={spendingPercentage >= 100 ? 'danger' : 'success'}
                  />
              </Col>
            </Row>
          </Form>
        </Card.Body>
        <p className="text-muted mt-2">📊 클릭하여 카테고리별 지출 비율을 확인하세요.</p>
      </Card>

      {/* Expenditure Breakdown Chart (Collapsible) */}
      <Collapse in={showExpenditureChart}>
        <div>
          <Card className="mb-4 shadow-sm p-3">
            <Card.Body>
              <h5>📌 카테고리별 지출 비율</h5>
              <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <BudgetExpenditureChart expenditures={budget.expenditures} />
              </div>
            </Card.Body>
          </Card>
        </div>
      </Collapse>

      {/* 지출 목록 */}
      <Row className='align-items-center'>
        <Col>
          <h3>💰 지출 내역</h3>
        </Col>
        <Col className='text-end'>
          <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
           ➕ 지출 추가
          </Button>
        </Col>
      </Row>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>📅 날짜</th>
            <th>💵 금액</th>
            <th>📂 카테고리</th>
            <th>📝 설명</th>
            <th>🗑️ 삭제</th>
          </tr>
        </thead>
        <tbody>
          {budget.expenditures.map((exp) => (
            <tr key={exp._id}>
              <td>{new Date(exp.date).toLocaleDateString()}</td>
              <td>₩{exp.amount.toLocaleString()}</td>
              <td>{exp.category}</td>
              <td>{exp.description}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => deleteExpenditure(exp._id)}>
                  🗑️
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 예산 수정 모달 */}
      {showBudgetModal && (
        <BudgetModal
          show={showBudgetModal}
          onClose={() => setShowBudgetModal(false)}
          initialBudget={budget}
          expenditures={budget.expenditures} // Pass expenditures to modal
          onUpdateBudget={handleUpdateBudget} // Pass the function to update instantly
        />
      )}

      {/* 지출 추가 모달 */}
      <ExpenditureModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={saveExpenditure}
        categories={budget.categories}
        expenditureInput={expenditureInput}
        handleInputChange={(e) => setExpenditureInput({ ...expenditureInput, [e.target.name]: e.target.value })}
      />


    </Container>
  );
};

export default BudgetDetails;
